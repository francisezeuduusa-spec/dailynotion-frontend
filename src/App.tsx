import React, { useState } from 'react';
import { AppProvider, useAppState } from './state';
import { LandingPage } from './components/LandingPage';
import { AuthPages } from './components/AuthPages';
import { OnboardingPages } from './components/OnboardingPages';
import { PrivacyPolicy, TermsOfService } from './components/StaticPages';
import { Dashboard } from './components/Dashboard';
import { DashboardHistory } from './components/DashboardHistory';
import { DashboardTemplates } from './components/DashboardTemplates';
import { DashboardSettings } from './components/DashboardSettings';
import { DashboardBilling } from './components/DashboardBilling';

import {
  House,
  Clock,
  Files,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Info,
  AlertCircle,
  CheckCircle2,
  Bell
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    currentUser,
    currentPath,
    onboarding,
    toasts,
    addToast,
    removeToast,
    navigate,
    logout,
    isBootstrapping,
  } = useAppState();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show spinner while checking stored tokens on first load
  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-canvas-white font-sans text-ash-gray">
        <span className="w-8 h-8 border-4 border-sage-green border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest font-mono font-bold">Loading DailyNotion...</span>
      </div>
    );
  }

  // Router dispatcher
  const renderRouteContent = () => {
    // Dynamic public routes
    if (currentPath === '/' || currentPath === '') {
      return <LandingPage onNavigate={navigate} />;
    }
    if (currentPath === '/privacy') {
      return <PrivacyPolicy onBack={() => navigate('/')} />;
    }
    if (currentPath === '/terms') {
      return <TermsOfService onBack={() => navigate('/')} />;
    }
    
    // Auth routes (only accessible if logged out)
    if (currentPath === '/signup') {
      return <AuthPages onNavigate={navigate} isSignUp={true} />;
    }
    if (currentPath === '/login') {
      return <AuthPages onNavigate={navigate} isSignUp={false} />;
    }

    // Google OAuth callback — reads real tokens from URL query params
    if (currentPath.startsWith('/auth/google/success')) {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');
      const redirectTo = params.get('redirectTo') || '/dashboard';
      if (accessToken && refreshToken) {
        import('./api').then(({ tokenStore }) => {
          tokenStore.setTokens(accessToken, refreshToken);
          window.location.hash = redirectTo;
          window.location.reload();
        });
      } else {
        setTimeout(() => navigate('/login?error=google_failed'), 200);
      }
      return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-canvas-white font-sans text-ash-gray">
          <span className="w-8 h-8 border-4 border-sage-green border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-xs uppercase tracking-widest font-mono font-bold">Authorizing workspace session...</span>
        </div>
      );
    }

    // Notion OAuth callback — ?notion=connected means backend already saved the token
    // We just need to refresh the user state and proceed
    if (currentPath.includes('select-databases') && new URLSearchParams(window.location.search).get('notion') === 'connected') {
      // Clean the URL query param without triggering a reload
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }

    // Onboarding screens
    if (
      currentPath === '/select-plan' ||
      currentPath === '/checkout' ||
      currentPath === '/onboarding/connect-notion' ||
      currentPath === '/onboarding/select-databases' ||
      currentPath === '/onboarding/choose-template' ||
      currentPath === '/onboarding/set-schedule'
    ) {
      let stepName: 'select-plan' | 'checkout' | 'connect-notion' | 'select-databases' | 'choose-template' | 'set-schedule' = 'select-plan';
      if (currentPath === '/checkout') stepName = 'checkout';
      if (currentPath === '/onboarding/connect-notion') stepName = 'connect-notion';
      if (currentPath === '/onboarding/select-databases') stepName = 'select-databases';
      if (currentPath === '/onboarding/choose-template') stepName = 'choose-template';
      if (currentPath === '/onboarding/set-schedule') stepName = 'set-schedule';

      return <OnboardingPages onNavigate={navigate} currentStep={stepName} />;
    }

    // DASHBOARD VIEWS - Authenticated states
    if (currentPath.startsWith('/dashboard')) {
      return renderDashboardLayout();
    }

    // Fallback error-bound redirect to landing page
    return <LandingPage onNavigate={navigate} />;
  };

  // Wrapper layout with Left SideBar for all /dashboard/* pages
  const renderDashboardLayout = () => {
    // Left side lists
    const navItems = [
      { path: '/dashboard', label: 'Dashboard', icon: House },
      { path: '/dashboard/history', label: 'History', icon: Clock },
      { path: '/dashboard/templates', label: 'Templates', icon: Files },
      { path: '/dashboard/settings', label: 'Settings', icon: Settings },
      { path: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    ];

    const getFirstName = () => currentUser?.full_name || 'User Profile';
    const initials = currentUser?.full_name ? currentUser.full_name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'U';

    const sidebarContent = () => (
      <div className="h-full flex flex-col justify-between py-8 px-6 text-charcoal-text font-sans">
        {/* Top brand header & user banner cards */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="font-bold text-lg text-charcoal-text tracking-tight">DailyNotion</span>
          </div>

          {/* User profile capsule card */}
          <div className="flex items-center gap-3.5 border-b border-cloud-gray/25 pb-5">
            <div className="w-10 h-10 rounded-full bg-parchment border border-whisper-gray overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} referrerPolicy="no-referrer" alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif font-bold text-xs text-ash-gray">{initials}</span>
              )}
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="font-sans font-semibold text-[13px] text-charcoal-text leading-tight truncate" title={currentUser?.full_name}>
                {getFirstName()}
              </span>
              <span className="font-sans text-[11px] text-cloud-gray truncate" title={currentUser?.email}>
                {currentUser?.email || 'bureau@alden.health'}
              </span>
            </div>
          </div>

          {/* Direct Nav Grid lists */}
          <nav className="flex flex-col gap-1.5 text-left">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-charcoal-text text-canvas-white shadow-sm font-bold border-l-2 border-sage-green'
                      : 'text-ash-gray hover:bg-parchment hover:text-charcoal-text'
                  }`}
                >
                  <IconComp size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout bottom trigger */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide text-ash-gray hover:bg-red-50 hover:text-red-650 transition-colors cursor-pointer border border-transparent hover:border-red-100"
        >
          <LogOut size={15} />
          <span>Log out</span>
        </button>
      </div>
    );

    return (
      <div className="min-h-screen bg-canvas-white text-charcoal-text flex flex-col md:flex-row font-sans relative selection:bg-sage-green selection:text-charcoal-text">
        {/* DESKTOP SIDEBAR PANEL FIXED frame */}
        <aside className="hidden md:block w-64 bg-canvas-white border-r border-whisper-gray shrink-0 h-screen sticky top-0">
          {sidebarContent()}
        </aside>

        {/* MOBILE COLLAPSIBLE RESPONSIVE HEADER */}
        <header className="md:hidden sticky top-0 z-40 bg-canvas-white/94 backdrop-blur-md border-b border-whisper-gray px-4 py-4 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="font-bold text-sm text-charcoal-text tracking-tight">DailyNotion</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick alert indicator button */}
            <button 
              onClick={() => addToast('System notification center is up-to-date.', 'info')}
              className="text-ash-gray hover:text-charcoal-text-600 transition-colors p-1"
            >
              <Bell size={18} />
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-md text-charcoal-text hover:bg-parchment cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* MOBILE OVERLAY SLIDEOUT DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-charcoal-text/25 backdrop-blur-xs flex">
            {/* Nav content card block */}
            <div className="w-64 bg-canvas-white border-r border-whisper-gray h-full animate-fade-in flex flex-col justify-between">
              {sidebarContent()}
            </div>
            {/* Closer click out border zone */}
            <div className="flex-grow h-full" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* MAIN WORKING DISPLAY CANVAS (Right content area) */}
        <main className="flex-grow py-8 px-6 md:p-12 max-w-5xl mx-auto w-full min-h-[calc(100vh-64px)] md:min-h-screen">
          {currentPath === '/dashboard' && <Dashboard onNavigate={navigate} />}
          {currentPath === '/dashboard/history' && <DashboardHistory />}
          {currentPath === '/dashboard/templates' && <DashboardTemplates />}
          {currentPath === '/dashboard/settings' && <DashboardSettings />}
          {currentPath === '/dashboard/billing' && <DashboardBilling />}
        </main>
      </div>
    );
  };

  // Toast notifier layer renderer popup
  const renderToastAlerts = () => {
    return (
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3.5 max-w-xs w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full p-4.5 rounded-xl border flex gap-3 text-xs shadow-xl items-start transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-canvas-white border-sage-green text-charcoal-text shadow-sage-green/5'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700 shadow-red-500/5'
                : 'bg-canvas-white border-whisper-gray text-ash-gray shadow-gray-500/5'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={16} className="text-sage-green shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            ) : (
              <Info size={16} className="text-ash-gray shrink-0 mt-0.5" />
            )}
            
            <div className="flex-grow leading-normal font-sans pr-4 font-semibold text-left">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-cloud-gray hover:text-charcoal-text cursor-pointer shrink-0 mt-0.5"
            >
              <X size={12} className="stroke-[3]" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      {renderRouteContent()}
      
      {/* Toast Alerts Frame */}
      {renderToastAlerts()}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
