import React, { useState, useEffect } from 'react';
import { useAppState } from '../state';
import { CheckCircle, Clock, FileCheck, Target, Flame, Database, AlertTriangle, RefreshCw, Layers, ArrowRight, ExternalLink } from 'lucide-react';
import { NotionLogo } from './NotionLogo';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    subscription,
    notionConfig,
    schedule,
    runs,
    generateJournalNow,
    toggleScheduleActive,
    fetchRuns,
    serverError,
    addToast
  } = useAppState();

  const [generating, setGenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  // Load latest runs and stats on mount
  useEffect(() => {
    fetchRuns(1);
  }, []);


  // Time based customized greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Good morning';
    if (hours >= 12 && hours < 17) return 'Good afternoon';
    if (hours >= 17 && hours < 21) return 'Good evening';
    return 'Good night';
  };

  const getFirstName = () => {
    if (!currentUser) return 'there';
    return currentUser.full_name.split(' ')[0];
  };

  const getFormattedDate = () => {
    const options: React.HTMLAttributes<HTMLSpanElement>['title'] = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    } as any;
    return new Date().toLocaleDateString('en-US', options as any);
  };

  // Stats calculators
  const getTotalRuns = () => runs.length;
  const getSuccessRate = () => {
    if (runs.length === 0) return 100;
    const successCount = runs.filter(r => r.status === 'success').length;
    return Math.round((successCount / runs.length) * 100);
  };
  const getStreak = () => {
    let streakCount = 0;
    for (let r of runs) {
      if (r.status === 'success') {
        streakCount++;
      } else {
        break;
      }
    }
    return streakCount;
  };

  // Helper to determine active journal state for today
  const hasGeneratedToday = () => {
    if (runs.length === 0) return false;
    const latest = runs[0];
    const latestDate = new Date(latest.run_at).toDateString();
    const todayDate = new Date().toDateString();
    return latestDate === todayDate && latest.status === 'success';
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await generateJournalNow();
    setGenerating(false);
  };

  const handleRegenerate = async () => {
    setShowRegenConfirm(false);
    setGenerating(true);
    await generateJournalNow();
    setGenerating(false);
  };

  const renderTodayJournalCard = () => {
    const isGenerated = hasGeneratedToday();
    const isPro = subscription?.plan !== 'free';
    const scheduleActive = schedule?.is_active;

    if (isGenerated) {
      const latestRun = runs[0];
      const timeStr = new Date(latestRun.run_at).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return (
        <div className="bg-canvas-white border border-cloud-gray rounded-2xl p-10 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
          {/* Subtle Accent Edge matching theme */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-sage-green" />
          
          <div className="w-16 h-16 rounded-full bg-sage-green/[0.15] text-sage-green flex items-center justify-center mb-6">
            <CheckCircle size={32} />
          </div>
          
          <h3 className="font-serif text-2xl font-semibold text-charcoal-text mb-1 tracking-wide">
            Today's Journal is complete
          </h3>
          
          <p className="font-sans text-xs text-ash-gray uppercase tracking-widest font-semibold font-mono mb-4">
            Generated today at <span className="text-charcoal-text font-bold">{timeStr}</span>
          </p>

          <p className="text-sm text-ash-gray mb-8">
             Pulled {latestRun.tasks_count} tasks · {latestRun.notes_count} notes directly from {notionConfig?.workspace_name || 'Notion'} Workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href={latestRun.notion_page_url}
              target="_blank"
              rel="noreferrer"
              className="bg-charcoal-text text-canvas-white font-semibold text-sm px-8 py-3.5 rounded-full hover:opacity-95 flex items-center gap-2 shadow-sm cursor-pointer"
              style={{ borderRadius: '100px' }}
            >
              <span>Open in Notion</span>
              <ExternalLink size={14} className="text-sage-green" />
            </a>
            
            <button
              onClick={() => setShowRegenConfirm(true)}
              className="text-xs font-semibold text-ash-gray hover:text-charcoal-text underline cursor-pointer"
            >
              Regenerate
            </button>
          </div>

          {/* Regenerate Confirmation dialog popover inside card */}
          {showRegenConfirm && (
            <div className="absolute inset-0 bg-parchment/95 flex flex-col justify-center items-center px-6">
              <h4 className="font-semibold text-charcoal-text text-base mb-2">Double-compile Warning</h4>
              <p className="text-xs text-ash-gray max-w-xs mb-6 leading-relaxed">
                This will create a second journal page for today in your Notion database. Are you sure you wish to proceed?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleRegenerate}
                  className="bg-charcoal-text text-canvas-white font-semibold text-xs py-2 px-5 hover:opacity-95 transition-all cursor-pointer"
                  style={{ borderRadius: '100px' }}
                >
                  Yes, regenerate
                </button>
                <button
                  onClick={() => setShowRegenConfirm(false)}
                  className="bg-canvas-white border border-whisper-gray text-ash-gray font-semibold text-xs py-2 px-5 hover:bg-parchment transition-all cursor-pointer"
                  style={{ borderRadius: '100px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isPro && scheduleActive) {
      return (
        <div className="bg-canvas-white border border-cloud-gray rounded-2xl p-10 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-zenith-blue" />
          
          <div className="w-16 h-16 rounded-full bg-zenith-blue/20 text-zenith-blue flex items-center justify-center mb-6">
            <Clock size={32} />
          </div>

          <h3 className="font-serif text-2xl font-semibold text-charcoal-text mb-1 tracking-wide">
            Not yet compiled today
          </h3>
          
          <p className="font-sans text-xs text-ash-gray uppercase tracking-widest font-semibold font-mono mb-4">
            Scheduled for {schedule?.generate_time || '08:00'} ({schedule?.timezone || 'EST'})
          </p>

          <p className="text-sm text-ash-gray max-w-sm mb-8 leading-relaxed">
            Your automated compiling engine is active. Your daily Notion journal page will be compiled automatically. Alternatively, you can run compiling instantly below.
          </p>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-sage-green text-charcoal-text font-bold text-sm px-8 py-3.5 hover:opacity-90 flex items-center justify-center gap-2 rounded-full cursor-pointer disabled:opacity-50"
            style={{ borderRadius: '100px' }}
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-charcoal-text border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Now</span>
            )}
          </button>
        </div>
      );
    }

    // STATE 3: Free plan / schedule paused
    return (
      <div className="bg-canvas-white border border-cloud-gray rounded-2xl p-10 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-whisper-gray" />
        
        <div className="w-16 h-16 rounded-full bg-parchment text-ash-gray flex items-center justify-center mb-6 border border-whisper-gray">
          <Database size={30} />
        </div>

        <h3 className="font-serif text-2xl font-semibold text-charcoal-text mb-1 tracking-wide">
          No daily journal compiled today
        </h3>

        <p className="text-xs text-ash-gray font-sans mb-4">
          {!isPro ? 'You are on the Free Plan' : 'Your daily schedule is paused'}
        </p>

        <p className="text-sm text-ash-gray max-w-sm mb-8 leading-relaxed">
          {!isPro
            ? "Create your daily Notion template page manually, prefilled with tasks and notes, in a single click."
            : "Your daily scheduled generator is currently paused. Activate it in settings or compile manually below."}
        </p>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-sage-green text-charcoal-text font-bold text-sm px-8 py-3.5 hover:opacity-90 flex items-center justify-center gap-2 rounded-full cursor-pointer disabled:opacity-50"
            style={{ borderRadius: '100px' }}
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-charcoal-text border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Now</span>
            )}
          </button>

          {!isPro && (
            <button
              onClick={() => onNavigate('/dashboard/billing')}
              className="text-xs font-semibold text-ash-gray hover:text-charcoal-text underline mt-1 cursor-pointer"
            >
              Upgrade to Pro for automatic daily generation →
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-10 font-sans text-charcoal-text text-left selection:bg-sage-green selection:text-charcoal-text">
      {/* Header and Welcome */}
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-1 text-charcoal-text">
          {getGreeting()}, {getFirstName()}.
        </h1>
        <p className="text-sm text-ash-gray font-medium font-sans">
          {getFormattedDate()}
        </p>
      </div>

      {/* Main Feature Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* State Card Frame on left/top */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          {renderTodayJournalCard()}

          {/* Stats Widget grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Run total */}
            <div className="bg-canvas-white border border-whisper-gray rounded-xl p-6 flex flex-col gap-2 relative">
              <FileCheck size={18} className="text-ash-gray mb-1" />
              <span className="text-3xl font-serif font-medium text-charcoal-text">{getTotalRuns()}</span>
              <span className="text-xs text-ash-gray tracking-wide font-medium">Journals generated</span>
            </div>

            {/* Success rates percentage */}
            <div className="bg-canvas-white border border-whisper-gray rounded-xl p-6 flex flex-col gap-2 relative">
              <Target size={18} className="text-ash-gray mb-1" />
              <span className={`text-3xl font-serif font-medium ${getSuccessRate() < 80 ? 'text-red-500' : 'text-sage-green'}`}>
                {getSuccessRate()}%
              </span>
              <span className="text-xs text-ash-gray tracking-wide font-medium">Success rate</span>
            </div>

            {/* Current Streak logs */}
            <div className="bg-canvas-white border border-whisper-gray rounded-xl p-6 flex flex-col gap-2 relative">
              <Flame size={18} className="text-red-500 mb-1" />
              <span className="text-3xl font-serif font-medium text-charcoal-text">
                {getStreak() > 0 ? `${getStreak()} 🔥` : '—'}
              </span>
              <span className="text-xs text-ash-gray tracking-wide font-medium">
                {getStreak() > 0 ? 'Day streak' : 'No active streak'}
              </span>
            </div>
          </div>
        </div>

        {/* Setup configuration detail panel right side card */}
        <div className="flex flex-col gap-8">
          {/* Notion Config Card summary */}
          <div className="bg-parchment rounded-2xl p-8 border border-whisper-gray flex flex-col gap-6 text-sm">
            <div className="flex items-center justify-between border-b border-cloud-gray pb-3">
              <h4 className="font-serif text-lg font-semibold text-charcoal-text">
                Your Notion Setup
              </h4>
              <NotionLogo size={18} className="text-charcoal-text opacity-75" />
            </div>

            {notionConfig?.connected ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-canvas-white border border-whisper-gray flex items-center justify-center shadow-sm text-sm">
                    {notionConfig.workspace_icon && notionConfig.workspace_icon !== '🏢' ? (
                      <span>{notionConfig.workspace_icon}</span>
                    ) : (
                      <NotionLogo size={16} className="text-charcoal-text" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-charcoal-text">{notionConfig.workspace_name}</span>
                    <span className="text-[10px] text-sage-green font-mono uppercase tracking-widest font-bold">● Connected</span>
                  </div>
                </div>

                <hr className="border-whisper-gray" />

                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-ash-gray font-semibold uppercase tracking-wider">Journal Destination:</span>
                    <span className="font-medium text-charcoal-text">{notionConfig.journal_db_name}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-ash-gray font-semibold uppercase tracking-wider">Active Task Feed:</span>
                    <span className="font-medium text-charcoal-text">{notionConfig.tasks_db_name}</span>
                  </div>

                  {notionConfig.notes_db_name && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-ash-gray font-semibold uppercase tracking-wider">Notes Fetch:</span>
                      <span className="font-medium text-charcoal-text">{notionConfig.notes_db_name}</span>
                    </div>
                  )}

                  {notionConfig.habits_db_name && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-ash-gray font-semibold uppercase tracking-wider">Habits Logging:</span>
                      <span className="font-medium text-charcoal-text">{notionConfig.habits_db_name}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('/onboarding/select-databases')}
                  className="text-xs font-semibold text-ash-gray hover:text-charcoal-text underline mt-2 flex items-center gap-1 cursor-pointer"
                >
                  <span>Change databases</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-center py-4">
                <AlertTriangle size={32} className="text-amber-500 mx-auto" />
                <p className="text-xs text-ash-gray leading-relaxed">
                  Your Notion integration has been disconnected. Automated scheduled runs are paused.
                </p>
                <button
                  onClick={() => onNavigate('/onboarding/connect-notion')}
                  className="bg-charcoal-text text-canvas-white font-bold text-xs py-2.5 px-4 rounded-full mt-2 cursor-pointer"
                  style={{ borderRadius: '100px' }}
                >
                  Connect Notion
                </button>
              </div>
            )}
          </div>

          {/* Schedule Summary Card */}
          {notionConfig?.connected && (
            <div className="bg-parchment rounded-2xl p-8 border border-whisper-gray flex flex-col gap-6 text-sm">
              <h4 className="font-serif text-lg font-semibold text-charcoal-text border-b border-cloud-gray pb-3">
                Your Schedule
              </h4>

              {subscription?.plan === 'free' ? (
                <div className="flex flex-col gap-3 py-1">
                  <p className="text-xs text-ash-gray leading-relaxed">
                    Automatic running scheduler is a premium Pro/Team trait. Toggle manual operations instantly here.
                  </p>
                  <button
                    onClick={() => onNavigate('/dashboard/billing')}
                    className="bg-charcoal-text text-canvas-white text-xs font-bold py-2.5 rounded-full text-center cursor-pointer"
                    style={{ borderRadius: '100px' }}
                  >
                    Upgrade to Pro
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ash-gray font-medium">Daily automatic compiling:</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${schedule?.is_active ? 'bg-sage-green animate-pulse' : 'bg-amber-400'}`} />
                      <span className="text-xs font-mono font-semibold tracking-wider">
                        {schedule?.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-ash-gray leading-normal">
                    {schedule?.is_active
                      ? `Compiling page precisely at ${schedule.generate_time} EST Daily.`
                      : `Paused daily triggers. Generator will not run automations.`}
                  </p>

                  <div className="flex justify-between items-center border-t border-whisper-gray pt-4">
                    <span className="text-xs text-charcoal-text font-semibold">
                      {schedule?.is_active ? 'Pause automatic schedules' : 'Resume schedules'}
                    </span>
                    <button
                      onClick={toggleScheduleActive}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        schedule?.is_active ? 'bg-sage-green' : 'bg-cloud-gray'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-canvas-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          schedule?.is_active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Runs Table Section */}
      <div className="bg-canvas-white border border-whisper-gray rounded-2xl p-6 md:p-8 mt-4 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-xl font-semibold text-charcoal-text">
            Recent Journal Runs
          </h3>
          <button
            onClick={() => onNavigate('/dashboard/history')}
            className="text-xs font-semibold text-ash-gray hover:text-charcoal-text underline cursor-pointer"
          >
            View full history →
          </button>
        </div>

        {runs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-ash-gray">No journals generated yet.</p>
            <p className="text-xs text-cloud-gray mt-1">Click 'Generate Now' above to build your first template log.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs text-ash-gray leading-normal">
              <thead>
                <tr className="border-b border-whisper-gray font-mono font-bold tracking-wider uppercase text-[10px] text-cloud-gray">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Trigger Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Records Synced</th>
                  <th className="py-3 px-3 text-right">Notion Link</th>
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 5).map((run) => {
                  const runDate = new Date(run.run_at);
                  const dateTimeStr = runDate.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });
                  const isSuccess = run.status === 'success';

                  return (
                    <tr key={run.id} className="border-b border-whisper-gray/50 hover:bg-parchment/30 transition-colors">
                      <td className="py-4 px-3 font-semibold text-charcoal-text whitespace-nowrap">
                        {dateTimeStr}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          run.trigger_type === 'scheduled'
                            ? 'bg-zenith-blue/20 text-charcoal-text'
                            : 'bg-wisper-gray bg-parchment text-ash-gray border border-whisper-gray'
                        }`}>
                          {run.trigger_type}
                        </span>
                      </td>
                      <td className="py-4 px-3 relative group whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1.5 bg-sage-green/[0.24] text-charcoal-text text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full border border-sage-green/30">
                            Success
                          </span>
                        ) : (
                          <div className="inline-block">
                            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full border border-red-200 cursor-help">
                              Failed ⚠️
                            </span>
                            {/* Hover Tooltip displaying exception string */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 hidden group-hover:block bg-charcoal-text text-canvas-white text-[11px] p-2.5 rounded shadow-lg z-20 text-center leading-normal">
                              {run.error_message || 'Database compile exception.'}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-charcoal-text" />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-3 font-medium text-charcoal-text whitespace-nowrap">
                        {isSuccess ? (
                          <span>{run.tasks_count} tasks · {run.notes_count} notes</span>
                        ) : (
                          <span className="text-cloud-gray">—</span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        {isSuccess && run.notion_page_url ? (
                          <a
                            href={run.notion_page_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-charcoal-text font-bold hover:underline"
                          >
                            <span>Open ↗</span>
                          </a>
                        ) : (
                          <span className="text-cloud-gray">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
