import React, { useState, useEffect } from 'react';
import { useAppState } from '../state';
import { Check, ArrowRight, Database, ChevronDown, CheckCircle, Clock, Key, CreditCard, ExternalLink, Moon } from 'lucide-react';
import { PlanType } from '../types';
import { NotionLogo } from './NotionLogo';

interface OnboardingPagesProps {
  onNavigate: (path: string) => void;
  currentStep: 'select-plan' | 'checkout' | 'connect-notion' | 'select-databases' | 'choose-template' | 'set-schedule';
}

export const OnboardingPages: React.FC<OnboardingPagesProps> = ({ onNavigate, currentStep }) => {
  const {
    subscription,
    notionConfig,
    templates,
    selectPlan,
    startStripeCheckout,
    connectNotion,
    fetchNotionDatabases,
    selectDatabases,
    selectDefaultTemplateOnboarding,
    setScheduleTime,
    addToast,
    isBootstrapping
  } = useAppState();

  const [loading, setLoading] = useState(false);

  // States for Plan view
  const [isYearly, setIsYearly] = useState(false);

  // States for Database Select view
  const [availableDbs, setAvailableDbs] = useState<Array<{ id: string; name: string }>>([]);
  const [dbsLoading, setDbsLoading] = useState(false);
  const [journalDb, setJournalDb] = useState('');
  const [tasksDb, setTasksDb] = useState('');
  const [notesDb, setNotesDb] = useState('');
  const [habitsDb, setHabitsDb] = useState('');

  // Load real databases from Notion when on the select-databases step
  useEffect(() => {
    if (currentStep === 'select-databases') {
      setDbsLoading(true);
      fetchNotionDatabases().then((dbs) => {
        setAvailableDbs(dbs);
        if (dbs.length > 0) {
          setJournalDb(dbs[0].id);
          setTasksDb(dbs.length > 1 ? dbs[1].id : dbs[0].id);
        }
        setDbsLoading(false);
      });
    }
  }, [currentStep]);

  // States for Choose Template view
  const [selectedTemplateName, setSelectedTemplateName] = useState('Simple Daily');

  // States for Set Schedule view
  const [generateTime, setGenerateTime] = useState('08:00');
  const [timezone, setTimezone] = useState('America/New_York');

  const progressSteps = [
    { num: 1, label: 'Connect Notion', stepId: 'connect-notion' },
    { num: 2, label: 'Select Databases', stepId: 'select-databases' },
    { num: 3, label: 'Choose Template', stepId: 'choose-template' },
    { num: 4, label: 'Set Schedule', stepId: 'set-schedule' },
  ];

  const getActiveStepIndex = () => {
    if (currentStep === 'connect-notion') return 0;
    if (currentStep === 'select-databases') return 1;
    if (currentStep === 'choose-template') return 2;
    if (currentStep === 'set-schedule') return 3;
    return -1;
  };

  const handleSelectPlan = async (plan: PlanType) => {
    setLoading(true);
    await selectPlan(plan, isYearly);
    setLoading(false);
  };

  const handleStripeCheckout = async () => {
    if (!subscription?.plan || subscription.plan === 'free') return;
    setLoading(true);
    await startStripeCheckout(subscription.plan, isYearly ? 'yearly' : 'monthly', 1);
    setLoading(false);
  };

  const handleConnectNotion = async () => {
    setLoading(true);
    // Save tokens to localStorage before leaving — they survive the full page redirect
    const accessToken = localStorage.getItem('dn_access_token');
    const refreshToken = localStorage.getItem('dn_refresh_token');
    if (!accessToken || !refreshToken) {
      addToast('Session expired. Please log in again.', 'error');
      onNavigate('/login');
      setLoading(false);
      return;
    }
    await connectNotion();
    setLoading(false);
  };

  const handleSelectDatabases = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalDb || !tasksDb) {
      addToast('Please select both a Journal and Tasks database.', 'error');
      return;
    }
    setLoading(true);
    const getName = (id: string) => availableDbs.find(d => d.id === id)?.name || '';
    await selectDatabases({
      journal_db_id: journalDb,
      journal_db_name: getName(journalDb),
      tasks_db_id: tasksDb,
      tasks_db_name: getName(tasksDb),
      notes_db_id: notesDb,
      notes_db_name: notesDb ? getName(notesDb) : '',
      habits_db_id: habitsDb,
      habits_db_name: habitsDb ? getName(habitsDb) : '',
    });
    setLoading(false);
  };

  const handleChooseTemplate = async () => {
    setLoading(true);
    await selectDefaultTemplateOnboarding(selectedTemplateName);
    setLoading(false);
  };

  const handleSetSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await setScheduleTime(generateTime, timezone);
    } finally {
      setLoading(false);
    }
  };

  // Render Step Indicator
  const renderProgressIndicator = () => {
    const activeIndex = getActiveStepIndex();
    if (activeIndex === -1) return null;

    return (
      <div className="w-full max-w-3xl mx-auto mb-10 px-4">
        <div className="flex justify-between items-center relative">
          {/* Progress bar line background */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-whisper-gray -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-sage-green -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${(activeIndex / (progressSteps.length - 1)) * 100}%` }}
          />

          {progressSteps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            return (
              <div key={step.num} className="flex flex-col items-center gap-2 z-10 relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-all ${
                    isCompleted
                      ? 'bg-sage-green text-charcoal-text border-2 border-sage-green shadow-sm'
                      : isActive
                      ? 'bg-charcoal-text text-canvas-white border-2 border-charcoal-text'
                      : 'bg-canvas-white text-cloud-gray border-2 border-whisper-gray'
                  }`}
                >
                  {isCompleted ? '✓' : step.num}
                </div>
                <span
                  className={`text-[11px] font-sans font-semibold uppercase tracking-wider hidden sm:inline ${
                    isActive ? 'text-charcoal-text font-bold' : 'text-ash-gray'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Don't render until auth is restored from localStorage
  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-canvas-white font-sans text-ash-gray">
        <span className="w-8 h-8 border-4 border-sage-green border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest font-mono font-bold">Restoring your session...</span>
      </div>
    );
  }

  // View 1: SELECT PLAN
  if (currentStep === 'select-plan') {
    return (
      <div className="min-h-screen bg-canvas-white text-charcoal-text py-16 px-4 selection:bg-sage-green selection:text-charcoal-text">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <header className="mb-10 max-w-xl text-center">
            <h1 className="font-serif text-[40px] leading-tight font-medium text-charcoal-text mb-2">
              Choose your plan
            </h1>
            <p className="text-sm text-ash-gray leading-relaxed font-sans">
              Get started with manual journal compiles or unleash scheduled automated pages. You can always change this later.
            </p>
          </header>

          <div className="inline-flex items-center gap-3 bg-parchment p-1 rounded-full border border-whisper-gray mb-12">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                !isYearly ? 'bg-charcoal-text text-canvas-white' : 'text-ash-gray hover:text-charcoal-text'
              }`}
              style={{ borderRadius: '100px' }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                isYearly ? 'bg-charcoal-text text-canvas-white' : 'text-ash-gray hover:text-charcoal-text'
              }`}
              style={{ borderRadius: '100px' }}
            >
              <span>Yearly</span>
              <span className="bg-sage-green text-charcoal-text text-[9px] font-bold px-1 py-0.5 rounded-full uppercase">Save 20%</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-left">
            {/* Plan Cards */}
            {/* Free */}
            <div className="bg-canvas-white border border-whisper-gray rounded-2xl p-8 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[11px] font-mono font-bold text-cloud-gray uppercase tracking-wider">Starter Tier</span>
                <h3 className="text-xl font-bold text-charcoal-text mt-1">Free</h3>
                <div className="my-4 flex items-baseline gap-1">
                  <span className="font-serif text-3xl font-medium">$0</span>
                  <span className="text-ash-gray text-xs">/ forever</span>
                </div>
                <hr className="border-whisper-gray my-4" />
                <ul className="flex flex-col gap-2.5 text-xs text-ash-gray mt-4">
                  <li className="flex items-center gap-2">✓ Manual generation only</li>
                  <li className="flex items-center gap-2">✓ 1 pre-built template</li>
                  <li className="flex items-center gap-2">✓ Pull from 1 database</li>
                  <li className="flex items-center gap-2">✓ 14-day run history</li>
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan('free')}
                disabled={loading}
                className="w-full text-center bg-canvas-white border border-cloud-gray hover:bg-parchment py-3 text-xs font-bold tracking-wide mt-8 transition-colors cursor-pointer"
                style={{ borderRadius: '100px' }}
              >
                Select Free
              </button>
            </div>

            {/* Pro */}
            <div className="bg-canvas-white border-2 border-sage-green rounded-2xl p-8 flex flex-col justify-between shadow-sm relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage-green text-charcoal-text text-[9px] font-bold tracking-widest uppercase px-3 py-0.5 rounded-full">
                RECOMMENDED
              </span>
              <div>
                <span className="text-[11px] font-mono font-bold text-cloud-gray uppercase tracking-wider">Automated Daily</span>
                <h3 className="text-xl font-bold text-charcoal-text mt-1">Pro</h3>
                <div className="my-4 flex items-baseline gap-1">
                  <span className="font-serif text-3xl font-medium">{isYearly ? '$3.75' : '$5'}</span>
                  <span className="text-ash-gray text-xs">/ month {isYearly ? '(billed $45 annually)' : ''}</span>
                </div>
                <hr className="border-whisper-gray my-4" />
                <ul className="flex flex-col gap-2.5 text-xs text-ash-gray mt-4">
                  <li className="flex items-center gap-2 font-semibold text-charcoal-text">✓ Scheduled daily generation</li>
                  <li className="flex items-center gap-2">✓ Pull from 3 databases</li>
                  <li className="flex items-center gap-2">✓ Custom templates builder</li>
                  <li className="flex items-center gap-2">✓ Email notification support</li>
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan('pro')}
                disabled={loading}
                className="w-full text-center bg-sage-green text-charcoal-text py-3 text-xs font-bold tracking-wide mt-8 hover:opacity-90 transition-opacity cursor-pointer"
                style={{ borderRadius: '100px' }}
              >
                Select Pro
              </button>
            </div>

            {/* Team */}
            <div className="bg-canvas-white border border-whisper-gray rounded-2xl p-8 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[11px] font-mono font-bold text-cloud-gray uppercase tracking-wider">Enterprise Teams</span>
                <h3 className="text-xl font-bold text-charcoal-text mt-1">Team</h3>
                <div className="my-4 flex items-baseline gap-1">
                  <span className="font-serif text-3xl font-medium">{isYearly ? '$11.25' : '$15'}</span>
                  <span className="text-ash-gray text-xs">/ month {isYearly ? '(billed $135 annually)' : ''}</span>
                </div>
                <hr className="border-whisper-gray my-4" />
                <ul className="flex flex-col gap-2.5 text-xs text-ash-gray mt-4">
                  <li className="flex items-center gap-2 font-semibold text-charcoal-text">✓ Everything in Pro for 5 seats</li>
                  <li className="flex items-center gap-2">✓ Shared team templates</li>
                  <li className="flex items-center gap-2">✓ Admin panel & controls</li>
                  <li className="flex items-center gap-2">✓ Audit logs & priorities</li>
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan('team')}
                disabled={loading}
                className="w-full text-center bg-canvas-white border border-cloud-gray hover:bg-parchment py-3 text-xs font-bold tracking-wide mt-8 transition-colors cursor-pointer"
                style={{ borderRadius: '100px' }}
              >
                Select Team
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View 2: CHECKOUT
  if (currentStep === 'checkout') {
    return (
      <div className="min-h-screen bg-canvas-white text-charcoal-text py-16 px-4 selection:bg-sage-green selection:text-charcoal-text flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-canvas-white border border-whisper-gray rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-[30px] leading-tight font-medium text-charcoal-text mb-2">
              Complete your purchase
            </h1>
            <p className="text-sm text-ash-gray font-sans">
              You're one step away from automated daily journaling.
            </p>
          </div>

          <div className="bg-parchment rounded-xl p-5 border border-whisper-gray flex flex-col gap-4 text-sm mb-6">
            <div className="flex justify-between items-center">
              <span className="text-ash-gray font-medium">Selected Tier:</span>
              <span className="font-semibold text-charcoal-text capitalize">{subscription?.plan || 'Pro'} Plan</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-ash-gray font-medium">Interval:</span>
              <span className="font-semibold text-charcoal-text capitalize">Billed {subscription?.interval || 'monthly'}</span>
            </div>

            <div className="border-t border-whisper-gray pt-4 flex justify-between items-center">
              <span className="text-charcoal-text font-semibold">Total Due:</span>
              <span className="font-serif text-2xl font-semibold text-charcoal-text">
                {subscription?.plan === 'team'
                  ? (subscription?.interval === 'yearly' ? '$290.00 / year' : '$29.00 / month')
                  : (subscription?.interval === 'yearly' ? '$100.00 / year' : '$10.00 / month')}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleStripeCheckout}
              disabled={loading}
              className="w-full bg-sage-green text-charcoal-text font-semibold text-sm py-4 rounded-full hover:opacity-90 flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
              style={{ borderRadius: '100px' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-charcoal-text border-t-transparent rounded-full animate-spin" />
              ) : (
                <CreditCard size={16} />
              )}
              <span>Proceed to secure checkout</span>
            </button>
            
            <button
              onClick={() => onNavigate('/select-plan')}
              disabled={loading}
              className="w-full text-center text-ash-gray hover:text-charcoal-text text-xs font-semibold cursor-pointer"
            >
              Change Selected Plan
            </button>
          </div>

          <p className="text-[10px] text-cloud-gray mt-6 text-center leading-relaxed">
            Powered by Stripe. We never see or store your card details.
          </p>
        </div>
      </div>
    );
  }

  // ONBOARDING PROGRESS HEADER TEMPLATE FOR ALL STEPS 1-4
  return (
    <div className="min-h-screen bg-canvas-white text-charcoal-text py-16 px-4 selection:bg-sage-green selection:text-charcoal-text">
      {renderProgressIndicator()}

      {/* STEP 1: CONNECT NOTION */}
      {currentStep === 'connect-notion' && (
        <div className="max-w-md mx-auto bg-canvas-white border border-whisper-gray rounded-2xl p-8 md:p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-parchment border border-whisper-gray flex items-center justify-center mx-auto mb-6">
            <NotionLogo size={32} className="text-charcoal-text" />
          </div>
          <h2 className="font-serif text-[28px] leading-tight font-medium text-charcoal-text mb-2">
            Connect your Notion workspace
          </h2>
          <p className="text-sm text-ash-gray font-sans mb-8">
            We need read and write access to create your daily journal pages and pull databases securely using official OAuth APIs.
          </p>

          <div className="bg-parchment p-4.5 rounded-xl border border-whisper-gray text-xs text-left text-ash-gray flex flex-col gap-3.5 mb-8">
            <p className="flex items-start gap-2.5">
              <Check size={14} className="text-sage-green shrink-0 mt-0.5" />
              <span>Only reads the specific databases you authorize.</span>
            </p>
            <p className="flex items-start gap-2.5">
              <Check size={14} className="text-sage-green shrink-0 mt-0.5" />
              <span>We never cache the contents of your actual files or notes.</span>
            </p>
            <p className="flex items-start gap-2.5">
              <Check size={14} className="text-sage-green shrink-0 mt-0.5" />
              <span>One click. Easy disconnect available in settings at any moment.</span>
            </p>
          </div>

          <button
            onClick={handleConnectNotion}
            disabled={loading}
            className="w-full bg-charcoal-text text-canvas-white font-semibold text-sm py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer shadow-sm"
            style={{ borderRadius: '100px' }}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-canvas-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ExternalLink size={14} className="text-sage-green" />
            )}
            <span>Connect Notion Workspace</span>
          </button>
        </div>
      )}

      {/* STEP 2: SELECT DATABASES */}
      {currentStep === 'select-databases' && (
        <div className="max-w-lg mx-auto bg-canvas-white border border-whisper-gray rounded-2xl p-8 md:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Database size={24} className="text-sage-green" />
            <h2 className="font-serif text-[26px] leading-tight font-medium text-charcoal-text">
              Select your Notion databases
            </h2>
          </div>
          <p className="text-sm text-ash-gray font-sans mb-8">
            Tell us which databases contain your today's goals and where we should write the journal entries.
          </p>

          <form onSubmit={handleSelectDatabases} className="flex flex-col gap-5">
            {dbsLoading && (
              <div className="flex items-center gap-2 text-xs text-ash-gray font-mono">
                <span className="w-4 h-4 border-2 border-sage-green border-t-transparent rounded-full animate-spin" />
                Loading your Notion databases...
              </div>
            )}

            {/* Journal database select */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                Journal Database <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={journalDb}
                  onChange={(e) => setJournalDb(e.target.value)}
                  disabled={dbsLoading}
                  className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg p-3 text-sm text-charcoal-text appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select journal database...</option>
                  {availableDbs.map(db => (
                    <option key={db.id} value={db.id}>{db.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ash-gray pointer-events-none" />
              </div>
            </div>

            {/* Task database select */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                Tasks Database <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={tasksDb}
                  onChange={(e) => setTasksDb(e.target.value)}
                  disabled={dbsLoading}
                  className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg p-3 text-sm text-charcoal-text appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select tasks database...</option>
                  {availableDbs.map(db => (
                    <option key={db.id} value={db.id}>{db.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ash-gray pointer-events-none" />
              </div>
            </div>

            {/* Notes optional select */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex justify-between">
                <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                  Notes Database
                </label>
                <span className="text-[10px] text-cloud-gray font-mono font-medium lowercase">Optional</span>
              </div>
              <div className="relative">
                <select
                  value={notesDb}
                  onChange={(e) => setNotesDb(e.target.value)}
                  disabled={dbsLoading}
                  className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg p-3 text-sm text-charcoal-text appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Skip (no notes)</option>
                  {availableDbs.map(db => (
                    <option key={db.id} value={db.id}>{db.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ash-gray pointer-events-none" />
              </div>
            </div>

            {/* Habit optional select */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex justify-between">
                <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                  Habits Tracker DB
                </label>
                <span className="text-[10px] text-cloud-gray font-mono font-medium lowercase">Optional</span>
              </div>
              <div className="relative">
                <select
                  value={habitsDb}
                  onChange={(e) => setHabitsDb(e.target.value)}
                  disabled={dbsLoading}
                  className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg p-3 text-sm text-charcoal-text appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Skip (no habits)</option>
                  {availableDbs.map(db => (
                    <option key={db.id} value={db.id}>{db.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ash-gray pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-center bg-sage-green text-charcoal-text font-semibold text-sm py-4 rounded-full hover:opacity-90 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              style={{ borderRadius: '100px' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-charcoal-text border-t-transparent rounded-full animate-spin" />
              ) : null}
              <span>Save and continue</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: CHOOSE TEMPLATE */}
      {currentStep === 'choose-template' && (
        <div className="max-w-5xl mx-auto px-4">
          <header className="text-center mb-10">
            <h2 className="font-serif text-[32px] leading-tight font-medium text-charcoal-text mb-2">
              Choose your journal template
            </h2>
            <p className="text-sm text-ash-gray font-sans max-w-xl mx-auto">
              This layout dictates the exact structures of compiling. You can custom modify or append placeholders in settings later.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {templates.slice(0, 3).map((tmpl) => {
              const isSelected = selectedTemplateName === tmpl.name;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateName(tmpl.name)}
                  className={`border-2 rounded-2xl p-6 bg-canvas-white text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected ? 'border-sage-green shadow-md bg-sage-green/[0.02]' : 'border-whisper-gray hover:border-cloud-gray'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-semibold text-base text-charcoal-text line-clamp-1">{tmpl.name}</span>
                      {isSelected && (
                        <span className="bg-sage-green text-charcoal-text text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Selected
                        </span>
                      )}
                    </div>
                    
                    <span className="text-[10px] font-bold text-cloud-gray font-mono uppercase block mb-2">Template Preview:</span>
                    <pre className="font-mono bg-parchment p-3 rounded-lg border border-whisper-gray text-[11px] leading-relaxed text-ash-gray h-56 overflow-y-auto whitespace-pre-wrap">
                      {tmpl.body}
                    </pre>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplateName(tmpl.name);
                    }}
                    className={`w-full py-2.5 text-xs font-semibold rounded-full mt-6 text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sage-green text-charcoal-text'
                        : 'bg-parchment text-ash-gray border border-whisper-gray hover:bg-cloud-gray hover:text-charcoal-text'
                    }`}
                    style={{ borderRadius: '100px' }}
                  >
                    <span>{isSelected ? 'Selected' : 'Use layout'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={handleChooseTemplate}
              disabled={loading}
              className="bg-charcoal-text text-canvas-white font-semibold text-sm py-4 px-12 hover:opacity-95 transition-all shadow-sm cursor-pointer"
              style={{ borderRadius: '100px' }}
            >
              {loading ? 'Saving template...' : 'Use selected template'}
            </button>
            {subscription?.plan === 'free' && (
              <p className="text-[11px] text-cloud-gray mt-4 font-mono">
                * Personalized custom builders require active Pro settings.
              </p>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: SET SCHEDULE */}
      {currentStep === 'set-schedule' && (
        <div className="max-w-md mx-auto bg-canvas-white border border-whisper-gray rounded-2xl p-8 md:p-10 shadow-sm text-center">
          <div className="w-12 h-12 bg-parchment border border-whisper-gray rounded-full flex items-center justify-center text-charcoal-text mx-auto mb-6">
            <Clock size={20} className="text-ash-gray" />
          </div>
          <h2 className="font-serif text-[28px] leading-tight font-medium text-charcoal-text mb-2 animate-fade-in">
            When should we generate your journal?
          </h2>
          <p className="text-sm text-ash-gray font-sans mb-8">
            We will synchronize with Notion servers and trigger compiling precisely at this time every morning.
          </p>

          {subscription?.plan === 'free' ? (
            <div className="flex flex-col gap-6">
              <div className="p-5 bg-parchment border border-whisper-gray rounded-xl text-xs text-ash-gray text-left leading-relaxed">
                <span className="font-semibold block text-charcoal-text mb-1">⏰ Scheduled generation is Pro-only</span>
                You are currently selecting the Free tier. You will be compiling pages manually with one click from your profile workspace. You can upgrade anytime!
              </div>

              <button
                onClick={handleChooseTemplate} // complete onboarding
                className="w-full bg-sage-green text-charcoal-text font-semibold text-sm py-4 rounded-full hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                style={{ borderRadius: '100px' }}
              >
                Go to dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSetSchedule} className="flex flex-col gap-5 text-left">
              {/* Daily generate time picker */}
              <div className="flex flex-col gap-1.5 focus-within:text-charcoal-text">
                <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                  Generate daily at
                </label>
                <input
                  type="time"
                  required
                  value={generateTime}
                  onChange={(e) => setGenerateTime(e.target.value)}
                  disabled={loading}
                  className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg p-3 text-sm text-charcoal-text"
                />
              </div>

              {/* Timezone picker */}
              <div className="flex flex-col gap-1.5 focus-within:text-charcoal-text">
                <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                  My timezone
                </label>
                <div className="relative">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    disabled={loading}
                    className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg p-3 text-sm text-charcoal-text appearance-none cursor-pointer"
                  >
                    <option value="America/New_York">America/New_York (EST / GMT-5)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST / GMT-8)</option>
                    <option value="Europe/London">Europe/London (GMT/BST / GMT+0)</option>
                    <option value="Europe/Paris">Europe/Paris (CET / GMT+1)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST / GMT+9)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ash-gray pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-center bg-sage-green text-charcoal-text font-semibold text-sm py-4 rounded-full mt-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                style={{ borderRadius: '100px' }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-charcoal-text border-t-transparent rounded-full animate-spin" />
                ) : null}
                <span>Save schedule and finish</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
