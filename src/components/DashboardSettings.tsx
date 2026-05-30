import React, { useState, useEffect } from 'react';
import { useAppState } from '../state';
import { ShieldAlert, Trash2, Key, Info, Check, RefreshCw, AlertTriangle, ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { NotionLogo } from './NotionLogo';

export const DashboardSettings: React.FC = () => {
  const {
    currentUser,
    subscription,
    notionConfig,
    schedule,
    updateProfileUser,
    changePasswordUser,
    deleteAccountUser,
    disconnectNotion,
    connectNotion,
    setScheduleTime,
    toggleScheduleActive,
    addToast
  } = useAppState();

  const isFree = subscription?.plan === 'free';

  // Section 1: Profiler
  const [profileName, setProfileName] = useState(currentUser?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Section 1: Password change
  const [currPsw, setCurrPsw] = useState('');
  const [nextPsw, setNextPsw] = useState('');
  const [savingPsw, setSavingPsw] = useState(false);

  // Section 2: Confirm Notion Disengage
  const [showNotionConfirm, setShowNotionConfirm] = useState(false);

  // Section 4: Schedule Change
  const [schedTime, setSchedTime] = useState(schedule?.generate_time || '08:00');
  const [schedTz, setSchedTz] = useState(schedule?.timezone || 'America/New_York');

  // Sync local state when schedule loads from API after mount
  useEffect(() => {
    if (schedule?.generate_time) setSchedTime(schedule.generate_time);
    if (schedule?.timezone) setSchedTz(schedule.timezone);
  }, [schedule?.generate_time, schedule?.timezone]);
  const [savingSched, setSavingSched] = useState(false);

  // Section 5: Danger Overlay Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Actions
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      addToast('Profile name cannot be blank.', 'error');
      return;
    }
    setSavingProfile(true);
    await updateProfileUser(profileName.trim());
    setSavingProfile(false);
  };

  const handlePswSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nextPsw.length < 8) {
      addToast('New password must be at least 8 characters.', 'error');
      return;
    }
    setSavingPsw(true);
    const ok = await changePasswordUser(currPsw, nextPsw);
    if (ok) {
      setCurrPsw('');
      setNextPsw('');
    }
    setSavingPsw(false);
  };

  const handleDisconnectNotion = async () => {
    setShowNotionConfirm(false);
    await disconnectNotion();
  };

  const handleScheduleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSched(true);
    await setScheduleTime(schedTime, schedTz);
    setSavingSched(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput !== 'DELETE') {
      addToast('Input must match DELETE.', 'error');
      return;
    }
    setDeletingAccount(true);
    const ok = await deleteAccountUser(deleteConfirmationInput);
    if (!ok) setDeletingAccount(false);
  };

  return (
    <div className="flex flex-col gap-10 font-sans text-charcoal-text text-left selection:bg-sage-green selection:text-charcoal-text relative">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-1 text-charcoal-text">
          Settings
        </h1>
        <p className="text-sm text-ash-gray font-sans font-medium">
          Manage workspace, credentials, scheduling, and billing preferences.
        </p>
      </div>

      {/* SECTION 1: ACCOUNT PROFILE */}
      <section className="bg-canvas-white border border-whisper-gray rounded-2xl p-6 md:p-8 flex flex-col gap-8 shadow-sm">
        <h3 className="font-serif text-xl font-semibold text-charcoal-text border-b border-whisper-gray pb-3">
          Account Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left profile/Avatar info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-parchment border border-whisper-gray overflow-hidden flex items-center justify-center shrink-0">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} referrerPolicy="no-referrer" alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif font-bold text-lg text-ash-gray">
                  {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-ash-gray uppercase tracking-widest font-mono font-bold">Profile Photo</span>
              <p className="text-[11px] text-cloud-gray leading-normal mt-1 max-w-[200px]">
                Profile photos sync dynamically via Google OAuth.
              </p>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleProfileSave} className="md:col-span-2 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg py-2.5 px-3.5 text-sm text-charcoal-text transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 opacity-80">
                <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                  Email Address
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentUser?.email || ''}
                  className="bg-parchment border border-whisper-gray rounded-lg py-2.5 px-3.5 text-sm text-ash-gray font-medium cursor-not-allowed"
                />
                <span className="text-[10px] text-cloud-gray font-mono italic">Email addresses cannot be modified.</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="bg-sage-green text-charcoal-text font-bold text-xs py-2.5 px-6 rounded-full w-fit hover:opacity-95 transition-opacity inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              style={{ borderRadius: '100px' }}
            >
              {savingProfile && <span className="w-3.5 h-3.5 border-2 border-charcoal-text border-t-transparent rounded-full animate-spin" />}
              <span>Save Name</span>
            </button>
          </form>
        </div>

        <hr className="border-whisper-gray" />

        {/* Password and Credential changes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <h4 className="font-semibold text-charcoal-text text-sm tracking-wide">Security & Password</h4>
            <p className="text-xs text-ash-gray mt-1 leading-normal">
              Authorize account changes and edit credential validation tags safely.
            </p>
          </div>

          <form onSubmit={handlePswSave} className="md:col-span-2 flex flex-col gap-4">
            {currentUser?.auth_provider === 'google' ? (
              <div className="p-4 bg-parchment rounded-xl border border-whisper-gray text-xs leading-normal flex gap-2.5 items-start text-ash-gray">
                <Info size={16} className="text-ash-gray shrink-0 mt-0.5" />
                <span>Google-connected workspaces utilize modern third-party federations. Passwords cannot be created.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currPsw}
                    onChange={(e) => setCurrPsw(e.target.value)}
                    className="bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg py-2 px-3 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                    New Password (min 8)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={nextPsw}
                    onChange={(e) => setNextPsw(e.target.value)}
                    className="bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg py-2 px-3 text-sm"
                  />
                </div>
              </div>
            )}

            {currentUser?.auth_provider !== 'google' && (
              <button
                type="submit"
                disabled={savingPsw}
                className="bg-canvas-white border border-cloud-gray hover:bg-parchment text-charcoal-text font-semibold text-xs py-2.5 px-6 rounded-full w-fit transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                style={{ borderRadius: '100px' }}
              >
                {savingPsw && <span className="w-3.5 h-3.5 border-2 border-charcoal-text border-t-transparent rounded-full animate-spin" />}
                <span>Update password</span>
              </button>
            )}
          </form>
        </div>
      </section>

      {/* SECTION 2: NOTION CONNECTION */}
      <section className="bg-canvas-white border border-whisper-gray rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        <h3 className="font-serif text-xl font-semibold text-charcoal-text border-b border-whisper-gray pb-3">
          Notion Integration
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-parchment border border-whisper-gray rounded-xl flex items-center justify-center shadow-sm">
              {notionConfig?.workspace_icon && notionConfig.workspace_icon !== '🏢' ? (
                <span className="text-2xl font-serif">{notionConfig.workspace_icon}</span>
              ) : (
                <NotionLogo size={24} className="text-charcoal-text" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-charcoal-text text-sm">
                {notionConfig?.connected ? notionConfig.workspace_name : 'No Workspace connected'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${notionConfig?.connected ? 'bg-sage-green' : 'bg-red-400'}`} />
                <span className="text-[10px] font-mono tracking-wider text-ash-gray uppercase font-bold">
                  {notionConfig?.connected ? 'Live Sync Active' : 'Offline / Interrupted'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => connectNotion()}
              disabled={!notionConfig?.connected}
              className="bg-canvas-white border border-cloud-gray hover:bg-parchment text-charcoal-text text-xs font-semibold py-3 px-5 transition-colors cursor-pointer rounded-full flex items-center gap-1.5"
              style={{ borderRadius: '100px' }}
            >
              <RefreshCw size={12} />
              <span>Reconnect Notion</span>
            </button>
            
            <button
              onClick={() => setShowNotionConfirm(true)}
              disabled={!notionConfig?.connected}
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold py-3 px-5 transition-colors cursor-pointer rounded-full"
              style={{ borderRadius: '100px' }}
            >
              Disconnect Workspace
            </button>
          </div>
        </div>

        {/* DISCONNECT CONFIRM DIALOG POPUP OVERLAY */}
        {showNotionConfirm && (
          <div className="fixed inset-0 bg-charcoal-text/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-canvas-white border border-cloud-gray shadow-2xl p-6 rounded-xl max-w-sm w-full text-center">
              <AlertTriangle size={36} className="text-red-500 mx-auto mb-4" />
              <h4 className="font-serif text-lg font-bold text-charcoal-text mb-2">Disconnect Notion?</h4>
              <p className="text-xs text-ash-gray mb-6 leading-relaxed">
                This will disconnect your Notion workspace and pause all automatic daily generation. Your schedule and custom templates will remain securely saved. You can reconnect any time.
              </p>
              <div className="flex justify-end gap-3.5">
                <button
                  onClick={() => setShowNotionConfirm(false)}
                  className="bg-canvas-white border border-whisper-gray text-ash-gray font-semibold text-xs px-4 py-2 hover:bg-parchment cursor-pointer"
                  style={{ borderRadius: '100px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisconnectNotion}
                  className="bg-red-500 text-canvas-white font-bold text-xs px-5 py-2 hover:bg-red-600 transition-colors cursor-pointer"
                  style={{ borderRadius: '100px' }}
                >
                  Yes, disconnect
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 3: DATABASES MAPPED */}
      {notionConfig?.connected && (
        <section className="bg-canvas-white border border-whisper-gray rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
          <h3 className="font-serif text-xl font-semibold text-charcoal-text border-b border-whisper-gray pb-3">
            Database Assignments & Mapping
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-ash-gray font-sans">
            <div className="flex flex-col bg-parchment/60 p-4 rounded-xl border border-whisper-gray">
              <span className="text-[10px] uppercase font-mono font-bold text-cloud-gray mb-1">Journal Output DB</span>
              <span className="font-semibold text-charcoal-text text-sm truncate">{notionConfig.journal_db_name}</span>
            </div>

            <div className="flex flex-col bg-parchment/60 p-4 rounded-xl border border-whisper-gray">
              <span className="text-[10px] uppercase font-mono font-bold text-cloud-gray mb-1">Tasks DB Feed</span>
              <span className="font-semibold text-charcoal-text text-sm truncate">{notionConfig.tasks_db_name}</span>
            </div>

            <div className="flex flex-col bg-parchment/60 p-4 rounded-xl border border-whisper-gray">
              <span className="text-[10px] uppercase font-mono font-bold text-cloud-gray mb-1">Notes DB (Optional)</span>
              <span className="font-semibold text-charcoal-text text-sm truncate">{notionConfig.notes_db_name || 'Not mapped (Skipped)'}</span>
            </div>

            <div className="flex flex-col bg-parchment/60 p-4 rounded-xl border border-whisper-gray">
              <span className="text-[10px] uppercase font-mono font-bold text-cloud-gray mb-1">Habits Tracker (Optional)</span>
              <span className="font-semibold text-charcoal-text text-sm truncate">{notionConfig.habits_db_name || 'Not mapped (Skipped)'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              window.location.hash = '/onboarding/select-databases';
            }}
            className="w-fit bg-parchment text-charcoal-text hover:bg-whisper-gray transition-colors text-xs font-bold py-3 px-6 rounded-full flex items-center gap-1.5"
            style={{ borderRadius: '100px' }}
          >
            <span>Modify database selections</span>
          </button>
        </section>
      )}

      {/* SECTION 4: JOURNAL SCHEDULE */}
      <section className="bg-canvas-white border border-whisper-gray rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        <h3 className="font-serif text-xl font-semibold text-charcoal-text border-b border-whisper-gray pb-3">
          Daily Schedule
        </h3>

        {isFree ? (
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 text-xs leading-normal flex items-start gap-2.5 text-amber-900">
            <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>Automatic journal compiler scheduler is only available on premium Pro and Team account setups. Compile manually on dashboard anytime!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${schedule?.is_active ? 'bg-sage-green' : 'bg-amber-400'}`} />
                <span className="font-semibold text-charcoal-text text-sm">
                  Automatic schedule is {schedule?.is_active ? 'Active' : 'Paused'}
                </span>
              </div>
              <p className="text-xs text-ash-gray leading-normal">
                You can pause automatic schedules instantly. When paused, no journals generate until toggled back on.
              </p>
              
              <div className="flex justify-between items-center bg-parchment border border-whisper-gray rounded-xl p-4 mt-4 text-xs font-semibold text-charcoal-text">
                <span>{schedule?.is_active ? 'Pause automatic trigger' : 'Resume automatic trigger'}</span>
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

            <form onSubmit={handleScheduleSave} className="md:col-span-2 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                    Trigger compiles daily at 
                  </label>
                  <input
                    type="time"
                    required
                    value={schedTime}
                    disabled={savingSched}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg p-2 text-sm text-charcoal-text"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[11px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                    Target timezone 
                  </label>
                  <div className="relative">
                    <select
                      value={schedTz}
                      disabled={savingSched}
                      onChange={(e) => setSchedTz(e.target.value)}
                      className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg p-2 text-sm text-charcoal-text appearance-none cursor-pointer"
                    >
                      <option value="America/New_York">America/New_York (EST / GMT-5)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST / GMT-8)</option>
                      <option value="Europe/London">Europe/London (GMT/BST / GMT+0)</option>
                      <option value="Europe/Paris">Europe/Paris (CET / GMT+1)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST / GMT+9)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSched}
                className="bg-sage-green text-charcoal-text font-bold text-xs py-2.5 px-6 rounded-full w-fit hover:opacity-95 transition-opacity inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                style={{ borderRadius: '100px' }}
              >
                {savingSched && <span className="w-3.5 h-3.5 border-2 border-charcoal-text border-t-transparent rounded-full animate-spin" />}
                <span>Save schedule</span>
              </button>
            </form>
          </div>
        )}
      </section>

      {/* SECTION 5: DANGER ZONE */}
      <section className="bg-canvas-white border border-red-200 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        <h3 className="font-serif text-xl font-semibold text-red-600 border-b border-red-100 pb-3">
          Danger Zone
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-sm text-ash-gray leading-normal">
          <p className="max-w-xl">
            Permanently delete your entire DailyNotion account, along with all configurations, history metadata, schedule times, and templates lists from our servers. This action is irreversible. Your actual Notion data will not be touched.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold py-3.5 px-6 rounded-full transition-colors cursor-pointer shrink-0"
            style={{ borderRadius: '100px' }}
          >
            Delete my account
          </button>
        </div>

        {/* ACCOUNT DELETE FULL-SCREEN OVERLAY CONFIRM MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-charcoal-text/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-canvas-white border border-red-200 shadow-2xl rounded-2xl max-w-md w-full p-6 md:p-8 text-center animate-fade-in font-sans">
              <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
              <h4 className="font-serif text-xl font-bold text-red-600 mb-2">Are you absolutely sure?</h4>
              
              <div className="bg-red-50 p-4.5 rounded-xl text-left text-xs leading-relaxed text-red-800 mb-6 flex flex-col gap-2">
                <p>• All your custom designed layout templates will be wiped.</p>
                <p>• Your automated scheduling intervals will be deleted.</p>
                <p>• DailyNotion compiled metadata history will be lost.</p>
                <p className="font-semibold text-red-950 mt-1">Note: This will not alter pages or databases currently existing in Notion.</p>
              </div>

              <div className="flex flex-col gap-4 text-left">
                <label className="text-xs font-semibold text-ash-gray">
                  Type <span className="font-mono bg-parchment text-charcoal-text font-bold px-1 py-0.5 rounded border border-whisper-gray">DELETE</span> below to confirm deletion:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Type DELETE"
                  value={deleteConfirmationInput}
                  onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                  className="bg-canvas-white border border-cloud-gray focus:border-red-500 focus:outline-none rounded-lg p-3 text-sm text-charcoal-text font-mono font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3.5 mt-8 border-t border-whisper-gray pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmationInput('');
                  }}
                  className="bg-canvas-white border border-whisper-gray text-ash-gray font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-parchment cursor-pointer"
                  style={{ borderRadius: '100px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmationInput !== 'DELETE' || deletingAccount}
                  className="bg-red-600 disabled:opacity-40 text-canvas-white font-bold text-xs py-2.5 px-5 rounded-full hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  style={{ borderRadius: '100px' }}
                >
                  {deletingAccount && <span className="w-3.5 h-3.5 border-2 border-canvas-white border-t-transparent rounded-full animate-spin" />}
                  <span>Confirm deletion</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
export default DashboardSettings;
