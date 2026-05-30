import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Subscription, NotionConfig, Template, Schedule, JournalRun, OnboardingState, PlanType } from './types';
import {
  authApi,
  billingApi,
  notionApi,
  onboardingApi,
  templatesApi,
  scheduleApi,
  journalApi,
  tokenStore,
} from './api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  subscription: Subscription | null;
  notionConfig: NotionConfig | null;
  templates: Template[];
  defaultTemplates: Template[];
  schedule: Schedule | null;
  runs: JournalRun[];
  runsPagination: { page: number; total: number; totalPages: number };
  onboarding: OnboardingState;
  toasts: Toast[];
  currentPath: string;
  serverError: string | null;
  isBootstrapping: boolean;

  navigate: (path: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  signup: (fullname: string, email: string, psw: string) => Promise<boolean>;
  login: (email: string, psw: string) => Promise<boolean>;
  logout: () => Promise<void>;
  selectPlan: (plan: PlanType, isYearly: boolean) => Promise<void>;
  startStripeCheckout: (plan: PlanType, interval: 'monthly' | 'yearly', seats?: number) => Promise<void>;
  googleConnect: () => void;
  connectNotion: () => Promise<void>;
  fetchNotionDatabases: () => Promise<Array<{ id: string; name: string; properties: string[] }>>;
  selectDatabases: (data: Partial<NotionConfig>) => Promise<void>;
  saveTemplate: (name: string, body: string, isDefault: boolean, id?: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  setDefaultTemplate: (id: string) => Promise<void>;
  selectDefaultTemplateOnboarding: (name: string) => Promise<void>;
  setScheduleTime: (time: string, timezone: string) => Promise<void>;
  toggleScheduleActive: () => Promise<void>;
  generateJournalNow: () => Promise<void>;
  fetchRuns: (page?: number) => Promise<void>;
  updateProfileUser: (fullname: string) => Promise<void>;
  changePasswordUser: (curr: string, next: string) => Promise<boolean>;
  deleteAccountUser: (confirmText: string) => Promise<boolean>;
  disconnectNotion: () => Promise<void>;
  openBillingPortal: () => Promise<void>;
  // kept for compatibility — no-ops in production
  resetToInitial: () => void;
  loadPrefilledDemo: () => void;
  injectMockError: (errorCode: string | null) => void;
  setSubscriptionStatus: (status: 'active' | 'past_due') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const mapOnboarding = (raw: any): OnboardingState => {
  if (!raw) return { step: 'select-plan', is_complete: false };
  if (raw.is_complete !== undefined) return raw; // already shaped
  // Map from backend onboarding_state shape
  const { notion_connected, journal_db_selected, tasks_db_selected,
          template_chosen, schedule_set, completed_at } = raw;
  let step: OnboardingState['step'] = 'select-plan';
  if (!notion_connected) step = 'connect-notion';
  else if (!journal_db_selected || !tasks_db_selected) step = 'select-databases';
  else if (!template_chosen) step = 'choose-template';
  else if (!schedule_set) step = 'set-schedule';
  else step = 'complete';
  return { step, is_complete: !!completed_at };
};

const mapSubscription = (raw: any): Subscription | null => {
  if (!raw) return null;
  return {
    plan: raw.plan,
    status: raw.status,
    interval: raw.billing_interval || 'monthly',
    seats: raw.seats || 1,
    current_period_end: raw.current_period_end || new Date(Date.now() + 30 * 86400000).toISOString(),
    created_at: raw.created_at || new Date().toISOString(),
  };
};

const mapNotionConfig = (raw: any): NotionConfig | null => {
  if (!raw) return null;
  return {
    connected: true,
    workspace_name: raw.workspace_name || '',
    workspace_icon: raw.workspace_icon || '',
    journal_db_id: raw.journal_db_id || '',
    journal_db_name: raw.journal_db_name || '',
    tasks_db_id: raw.tasks_db_id || '',
    tasks_db_name: raw.tasks_db_name || '',
    notes_db_id: raw.notes_db_id || '',
    notes_db_name: raw.notes_db_name || '',
    habits_db_id: raw.habits_db_id || '',
    habits_db_name: raw.habits_db_name || '',
  };
};

const mapSchedule = (raw: any): Schedule | null => {
  if (!raw) return null;
  return {
    generate_time: raw.generate_time?.slice(0, 5) || '08:00',
    timezone: raw.timezone || 'UTC',
    is_active: raw.is_active ?? true,
  };
};

const mapTemplate = (raw: any): Template => ({
  id: raw.id,
  name: raw.name,
  body: raw.body,
  is_default: raw.is_default,
  is_custom: true,
});

const mapRun = (raw: any): JournalRun => ({
  id: raw.id,
  run_at: raw.run_at,
  status: raw.status,
  tasks_count: raw.tasks_count || 0,
  notes_count: raw.notes_count || 0,
  trigger_type: raw.trigger || 'manual',
  notion_page_url: raw.notion_page_url,
  error_message: raw.error_message,
});

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [notionConfig, setNotionConfig] = useState<NotionConfig | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [runs, setRuns] = useState<JournalRun[]>([]);
  const [runsPagination, setRunsPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [onboarding, setOnboarding] = useState<OnboardingState>({ step: 'select-plan', is_complete: false });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>(() =>
    window.location.hash.replace('#', '') || '/'
  );

  // ── Toast helpers ──
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Navigation ──
  const navigate = useCallback((path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  }, []);

  // ── Bootstrap: load user on app start if token exists ──
  useEffect(() => {
    const boot = async () => {
      // First try in-memory token, then fall back to localStorage
      let token = tokenStore.getAccessToken();
      if (!token || token === '') {
        const stored = localStorage.getItem('dn_access_token');
        if (stored && stored !== 'null' && stored !== 'undefined' && stored !== '' && stored.length > 20) {
          token = stored;
          _accessToken = stored; // restore in-memory
        }
      }
      if (!token || token === '') {
        setIsBootstrapping(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setCurrentUser(data.user);
        setSubscription(mapSubscription(data.subscription));
        setOnboarding(mapOnboarding(data.onboarding));
      } catch (err: any) {
        // Only clear tokens on a real 401 — not on network errors or timeouts
        // This prevents losing the session after a Notion/Google OAuth redirect
        const status = err?.response?.status;
        if (status === 401) {
          tokenStore.clearTokens();
        }
        // For any other error (500, network timeout, etc.) keep the token
        // and let the user stay on the page — the token may still be valid
      } finally {
        setIsBootstrapping(false);
      }
    };
    boot();
  }, []);

  // ── Hash routing ──
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleHash = () => {
      const path = window.location.hash.replace('#', '') || '/';
      // If trying to access dashboard without a user loaded, check token first
      // If token exists, user is logged in - just wait for user data to load
      // Only redirect to login if there's no token at all
      if (path.startsWith('/dashboard') && !currentUser && !isBootstrapping) {
        const token = tokenStore.getAccessToken();
        if (!token || token === '') {
          navigate('/login');
        } else {
          // Token exists but user not loaded yet - stay on dashboard, don't redirect
          setCurrentPath(path);
        }
        return;
      }
      setCurrentPath(path);
    };
    
    window.addEventListener('hashchange', handleHash);
    // Small delay to allow state updates to settle before routing decision
    timeoutId = setTimeout(handleHash, 50);
    
    return () => {
      window.removeEventListener('hashchange', handleHash);
      clearTimeout(timeoutId);
    };
  }, [currentUser, isBootstrapping, navigate]);

  // ─────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────
  const signup = async (fullname: string, email: string, psw: string): Promise<boolean> => {
    try {
      const { data } = await authApi.signup(fullname, email, psw);
      tokenStore.setTokens(data.accessToken, data.refreshToken);
      setCurrentUser(data.user);
      setSubscription(null);
      setOnboarding({ step: 'select-plan', is_complete: false });
      addToast("Account created! Let's pick your plan.", 'success');
      navigate(data.nextStep || '/select-plan');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0]?.msg
        || err.response?.data?.error
        || 'Signup failed. Please try again.';
      addToast(msg, 'error');
      return false;
    }
  };

  const login = async (email: string, psw: string): Promise<boolean> => {
    try {
      const { data } = await authApi.login(email, psw);
      tokenStore.setTokens(data.accessToken, data.refreshToken);
      setCurrentUser(data.user);
      setSubscription(mapSubscription(data.subscription));
      setOnboarding(mapOnboarding(data.onboarding));
      addToast('Welcome back to DailyNotion!', 'success');
      navigate(data.redirectTo || '/dashboard');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid email or password.';
      addToast(msg, 'error');
      return false;
    }
  };

  const logout = async () => {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch { /* ignore */ }
    tokenStore.clearTokens();
    setCurrentUser(null);
    setSubscription(null);
    setNotionConfig(null);
    setTemplates([]);
    setSchedule(null);
    setRuns([]);
    setOnboarding({ step: 'select-plan', is_complete: false });
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  // Google OAuth — redirect to backend, which handles everything and
  // redirects back to /auth/google/success?accessToken=...&refreshToken=...&redirectTo=...
  const googleConnect = () => {
    window.location.href = authApi.getGoogleAuthUrl();
  };

  // ─────────────────────────────────────────────
  // PLANS & BILLING
  // ─────────────────────────────────────────────
  const selectPlan = async (plan: PlanType, isYearly: boolean) => {
    try {
      const { data } = await billingApi.selectPlan(plan);
      if (plan === 'free') {
        // Refresh user to get updated status
        const meRes = await authApi.me();
        setCurrentUser(meRes.data.user);
        setSubscription(mapSubscription(meRes.data.subscription));
        setOnboarding(mapOnboarding(meRes.data.onboarding));
        addToast("Free plan activated. Let's connect Notion!", 'success');
      }
      // Store interval choice for checkout page
      localStorage.setItem('dn_checkout_interval', isYearly ? 'yearly' : 'monthly');
      navigate(data.redirectTo || '/onboarding/connect-notion');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to select plan.', 'error');
    }
  };

  const startStripeCheckout = async (plan: PlanType, interval: 'monthly' | 'yearly', seats = 1) => {
    try {
      const { data } = await billingApi.createCheckout(plan, interval, seats);
      // Redirect to Stripe — user will come back to /onboarding/connect-notion
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to start checkout.', 'error');
    }
  };

  const openBillingPortal = async () => {
    try {
      const { data } = await billingApi.openPortal();
      window.location.href = data.portalUrl;
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to open billing portal.', 'error');
    }
  };

  // ─────────────────────────────────────────────
  // NOTION
  // ─────────────────────────────────────────────
  const connectNotion = async () => {
    try {
      const { data } = await notionApi.getAuthUrl();
      // Persist tokens explicitly before full page redirect
      // so they survive the Notion OAuth round-trip
      const access = tokenStore.getAccessToken();
      const refresh = tokenStore.getRefreshToken();
      if (access) localStorage.setItem('dn_access_token', access);
      if (refresh) localStorage.setItem('dn_refresh_token', refresh);
      // Redirect browser to Notion OAuth
      window.location.href = data.authUrl;
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to get Notion auth URL.', 'error');
    }
  };

  const fetchNotionDatabases = async () => {
    try {
      const { data } = await notionApi.getDatabases();
      return data.databases || [];
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to fetch Notion databases.', 'error');
      return [];
    }
  };

  const selectDatabases = async (dbData: Partial<NotionConfig>) => {
    try {
      await notionApi.selectDatabases({
        journal_db_id: dbData.journal_db_id!,
        journal_db_name: dbData.journal_db_name!,
        tasks_db_id: dbData.tasks_db_id!,
        tasks_db_name: dbData.tasks_db_name!,
        notes_db_id: dbData.notes_db_id || '',
        notes_db_name: dbData.notes_db_name || '',
        habits_db_id: dbData.habits_db_id || '',
        habits_db_name: dbData.habits_db_name || '',
      });
      // Refresh config
      const { data } = await notionApi.getConfig();
      setNotionConfig(mapNotionConfig(data.config));
      // Update onboarding
      const meRes = await authApi.me();
      setOnboarding(mapOnboarding(meRes.data.onboarding));
      addToast('Databases saved!', 'success');
      navigate('/onboarding/choose-template');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to save databases.', 'error');
    }
  };

  const disconnectNotion = async () => {
    try {
      await notionApi.disconnect();
      setNotionConfig(null);
      setSchedule(null);
      setOnboarding({ step: 'connect-notion', is_complete: false });
      addToast('Notion disconnected.', 'info');
      navigate('/onboarding/connect-notion');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to disconnect Notion.', 'error');
    }
  };

  // ─────────────────────────────────────────────
  // TEMPLATES
  // Default templates are hardcoded here so they
  // always show during onboarding even before any
  // API call succeeds. They exactly match the backend.
  // ─────────────────────────────────────────────
  const STATIC_DEFAULT_TEMPLATES: Template[] = [
    {
      id: 'dt-1',
      name: 'Simple Daily',
      body: `# Journal — {{date}}\n\n## ✅ Today's Tasks\n{{tasks_today}}\n\n## 📝 Recent Notes\n{{notes_last_24h}}\n\n---\n*My reflections:*\n\n`,
      is_default: false,
      is_custom: false,
    },
    {
      id: 'dt-2',
      name: 'Full Daily Review',
      body: `# Daily Journal — {{date}}\n\n## 🗓 Today's Schedule\n{{meetings_today}}\n\n## ✅ Tasks Due Today\n{{tasks_today}}\n\n## 📝 Notes from Yesterday\n{{notes_last_24h}}\n\n## 🔄 Habits\n{{habit_tracker}}\n\n---\n## 💭 Reflections\n**What went well:**\n\n**What was challenging:**\n\n**Tomorrow's focus:**\n\n`,
      is_default: false,
      is_custom: false,
    },
    {
      id: 'dt-3',
      name: 'Minimal',
      body: `# {{date}}\n\n{{tasks_today}}\n\n---\n`,
      is_default: false,
      is_custom: false,
    },
  ];

  // Set static defaults immediately so onboarding never shows empty
  const [defaultTemplates, setDefaultTemplates] = useState<Template[]>(STATIC_DEFAULT_TEMPLATES);

  const fetchTemplates = async () => {
    // Always ensure static defaults are present
    setDefaultTemplates(STATIC_DEFAULT_TEMPLATES);
    try {
      const { data } = await templatesApi.list();
      setTemplates((data.templates || []).map(mapTemplate));
      // If backend returns defaults, use those — otherwise keep static ones
      if (data.defaultTemplates && data.defaultTemplates.length > 0) {
        setDefaultTemplates(
          data.defaultTemplates.map((t: any, i: number) => ({
            id: `dt-${i + 1}`,
            name: t.name,
            body: t.body,
            is_default: false,
            is_custom: false,
          }))
        );
      }
    } catch {
      // Keep static defaults on error — user always sees templates
    }
  };

  const saveTemplate = async (name: string, body: string, isDefault: boolean, id?: string) => {
    try {
      if (id) {
        await templatesApi.update(id, { name, body, is_default: isDefault });
        addToast('Template updated ✓', 'success');
      } else {
        await templatesApi.create(name, body, isDefault);
        addToast('Template saved ✓', 'success');
      }
      await fetchTemplates();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save template.';
      addToast(msg, 'error');
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await templatesApi.delete(id);
      addToast('Template deleted.', 'success');
      await fetchTemplates();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to delete template.', 'error');
    }
  };

  const setDefaultTemplate = async (id: string) => {
    try {
      await templatesApi.update(id, { is_default: true });
      addToast('Default template updated ✓', 'success');
      await fetchTemplates();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to update default template.', 'error');
    }
  };

  const selectDefaultTemplateOnboarding = async (name: string) => {
    try {
      await templatesApi.onboardingSelect({ use_default: true, default_template_name: name });
      const meRes = await authApi.me();
      setOnboarding(mapOnboarding(meRes.data.onboarding));
      addToast('Template saved!', 'success');
      navigate('/onboarding/set-schedule');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to select template.', 'error');
    }
  };

  // ─────────────────────────────────────────────
  // SCHEDULE
  // ─────────────────────────────────────────────
  const setScheduleTime = async (time: string, timezone: string) => {
    try {
      const { data } = await scheduleApi.save(time, timezone);
      setSchedule(mapSchedule(data.schedule));
      // Refresh onboarding state
      const meRes = await authApi.me();
      setOnboarding(mapOnboarding(meRes.data.onboarding));
      addToast('Schedule set! Your first journal generates tomorrow morning.', 'success');
      navigate(data.redirectTo || '/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save schedule.';
      // Free plan restriction — still navigate to dashboard
      if (err.response?.data?.code === 'PLAN_REQUIRED') {
        const meRes = await authApi.me();
        setOnboarding(mapOnboarding(meRes.data.onboarding));
        addToast('Free plan activated! Schedule is a Pro feature.', 'info');
        navigate('/dashboard');
        return;
      }
      addToast(msg, 'error');
    }
  };

  const toggleScheduleActive = async () => {
    try {
      const { data } = await scheduleApi.toggle();
      setSchedule(mapSchedule(data.schedule));
      addToast(data.schedule.is_active ? 'Schedule resumed.' : 'Schedule paused.', 'info');
    } catch (err: any) {
      const status = err?.response?.status;
      // If no schedule exists yet, create one first then toggle
      if (status === 404) {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
          const { data } = await scheduleApi.save('08:00', tz);
          setSchedule(mapSchedule(data.schedule));
          addToast('Schedule created and activated.', 'success');
        } catch (saveErr: any) {
          addToast(saveErr.response?.data?.error || 'Failed to create schedule.', 'error');
        }
        return;
      }
      addToast(err.response?.data?.error || 'Failed to toggle schedule.', 'error');
    }
  };

  // ─────────────────────────────────────────────
  // JOURNAL
  // ─────────────────────────────────────────────
  const generateJournalNow = async () => {
    try {
      const { data } = await journalApi.generate();
      addToast('Journal generated! Opening in Notion...', 'success');
      // Refresh runs list
      await fetchRuns(1);
      if (data.pageUrl) {
        setTimeout(() => window.open(data.pageUrl, '_blank'), 800);
      }
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === 'ALREADY_GENERATED_TODAY') {
        const url = err.response.data.existingPageUrl;
        addToast("Today's journal already exists. Opening it now...", 'info');
        if (url) window.open(url, '_blank');
        return;
      }
      addToast(err.response?.data?.error || 'Journal generation failed.', 'error');
    }
  };

  const fetchRuns = async (page = 1) => {
    try {
      const { data } = await journalApi.getRuns(page, 20);
      setRuns((data.runs || []).map(mapRun));
      setRunsPagination({
        page: data.pagination?.page || 1,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 1,
      });
    } catch { /* silently ignore */ }
  };

  // ─────────────────────────────────────────────
  // PROFILE
  // ─────────────────────────────────────────────
  const updateProfileUser = async (fullname: string) => {
    try {
      const { data } = await authApi.updateProfile(fullname);
      setCurrentUser(data.user);
      addToast('Saved ✓', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to update profile.', 'error');
    }
  };

  const changePasswordUser = async (curr: string, next: string): Promise<boolean> => {
    try {
      await authApi.changePassword(curr, next);
      addToast('Password updated successfully.', 'success');
      return true;
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to change password.', 'error');
      return false;
    }
  };

  const deleteAccountUser = async (confirmText: string): Promise<boolean> => {
    try {
      await authApi.deleteAccount(confirmText);
      tokenStore.clearTokens();
      setCurrentUser(null);
      setSubscription(null);
      setNotionConfig(null);
      setTemplates([]);
      setSchedule(null);
      setRuns([]);
      setOnboarding({ step: 'select-plan', is_complete: false });
      addToast('Your account has been deleted.', 'success');
      navigate('/');
      return true;
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to delete account.', 'error');
      return false;
    }
  };

  // ─────────────────────────────────────────────
  // Load dashboard data when user lands on /dashboard
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || !currentPath.startsWith('/dashboard')) return;

    const load = async () => {
      await Promise.allSettled([
        notionApi.getConfig().then(({ data }) => setNotionConfig(mapNotionConfig(data.config))).catch(() => {}),
        scheduleApi.get().then(({ data }) => {
          if (data.schedule) setSchedule(mapSchedule(data.schedule));
        }).catch(() => {}),
        fetchTemplates(),
        fetchRuns(1),
        billingApi.getSubscription().then(({ data }) => {
          if (data.subscription) setSubscription(mapSubscription(data.subscription));
        }).catch(() => {}),
      ]);
    };

    load();
  }, [currentUser, currentPath]);

  // ─────────────────────────────────────────────
  // NO-OP stubs kept so UI components don't break
  // Remove these once you're fully in production
  // ─────────────────────────────────────────────
  const resetToInitial = () => {
    addToast('Reset is disabled in production mode.', 'info');
  };
  const loadPrefilledDemo = () => {
    addToast('Demo mode is disabled in production mode.', 'info');
  };
  const injectMockError = (_: string | null) => {};
  const setSubscriptionStatus = (_: 'active' | 'past_due') => {};

  return (
    <AppContext.Provider
      value={{
        currentUser,
        subscription,
        notionConfig,
        templates,
        defaultTemplates,
        schedule,
        runs,
        runsPagination,
        onboarding,
        toasts,
        currentPath,
        serverError,
        isBootstrapping,
        navigate,
        addToast,
        removeToast,
        signup,
        login,
        logout,
        selectPlan,
        startStripeCheckout,
        googleConnect,
        connectNotion,
        fetchNotionDatabases,
        selectDatabases,
        saveTemplate,
        deleteTemplate,
        setDefaultTemplate,
        selectDefaultTemplateOnboarding,
        setScheduleTime,
        toggleScheduleActive,
        generateJournalNow,
        fetchRuns,
        updateProfileUser,
        changePasswordUser,
        deleteAccountUser,
        disconnectNotion,
        openBillingPortal,
        resetToInitial,
        loadPrefilledDemo,
        injectMockError,
        setSubscriptionStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppState must be used within AppProvider');
  return context;
};
