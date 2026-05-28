import React, { useState } from 'react';
import { useAppState } from '../state';
import { Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onNavigate: (path: string) => void;
  isSignUp?: boolean;
}

export const AuthPages: React.FC<AuthPageProps> = ({ onNavigate, isSignUp = false }) => {
  const { signup, login, googleConnect, addToast } = useAppState();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setLoading(true);

    if (isSignUp) {
      if (!fullname.trim()) {
        setErrorText('Full name is required.');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setErrorText('Password must be at least 8 characters.');
        setLoading(false);
        return;
      }
      const ok = await signup(fullname, email, password);
      if (!ok) {
        setErrorText('Registration failed. Please check inputs.');
      }
    } else {
      const ok = await login(email, password);
      if (!ok) {
        setErrorText('Invalid email or password.');
      }
    }
    setLoading(false);
  };

  const handleGoogleConnect = async () => {
    setLoading(true);
    await googleConnect();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-canvas-white text-charcoal-text font-sans antialiased flex flex-col justify-center items-center py-12 px-4 selection:bg-sage-green selection:text-charcoal-text">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-10 cursor-pointer" onClick={() => onNavigate('/')}>
        <span className="font-sans font-bold text-xl text-charcoal-text tracking-tight">DailyNotion</span>
      </div>

      {/* Main Auth Container Card */}
      <div className="w-full max-w-md bg-canvas-white border border-whisper-gray rounded-2xl p-8 md:p-10 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-[30px] leading-tight font-medium text-charcoal-text mb-2">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-ash-gray font-sans">
            {isSignUp ? 'Start automating your Notion journal today.' : 'Log in to your DailyNotion account.'}
          </p>
        </div>

        {errorText && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3.5 mb-6 flex items-start gap-2.5 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        {/* OAuth G Method */}
        <button
          onClick={handleGoogleConnect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-canvas-white border border-cloud-gray hover:bg-parchment text-charcoal-text text-sm font-semibold tracking-wide py-3.5 rounded-full transition-all cursor-pointer disabled:opacity-50"
          style={{ borderRadius: '100px' }}
        >
          {/* Custom SVG logo representing Google G */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.99 1 12 1 7.24 1 3.21 3.76 1.34 7.78l3.87 3C6.13 7.8 8.79 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57v2.97h3.91c2.28-2.1 3.54-5.19 3.54-8.69z"
            />
            <path
              fill="#FBBC05"
              d="M5.21 14.78A7.018 7.018 0 014.8 12c0-.98.17-1.92.41-2.78L1.34 6.22C.49 7.96 0 9.93 0 12s.49 4.04 1.34 5.78l3.87-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.08 7.96-2.91l-3.91-2.97c-1.12.75-2.55 1.19-4.05 1.19-3.21 0-5.87-2.76-6.79-5.74l-3.87 3C3.21 20.24 7.24 23 12 23z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Separator lines text */}
        <div className="flex items-center gap-3 my-6">
          <hr className="flex-grow border-whisper-gray" />
          <span className="text-xs uppercase font-mono tracking-widest text-cloud-gray">or</span>
          <hr className="flex-grow border-whisper-gray" />
        </div>

        {/* Direct Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[12px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                Full name
              </label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash-gray" />
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  disabled={loading}
                  className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg pl-10 pr-4 py-3 text-sm text-charcoal-text transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[12px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
              Email address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash-gray" />
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg pl-10 pr-4 py-3 text-sm text-charcoal-text transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-[12px] uppercase tracking-wider font-semibold font-mono text-ash-gray">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => addToast('Password reset is coming soon. Contact support@dailynotion.app for help.', 'info')}
                  className="text-xs text-ash-gray hover:text-charcoal-text underline cursor-pointer"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash-gray" />
              <input
                type="password"
                required
                placeholder={isSignUp ? 'At least 8 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-canvas-white border border-cloud-gray focus:border-sage-green focus:outline-none rounded-lg pl-10 pr-4 py-3 text-sm text-charcoal-text transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-center bg-sage-green text-charcoal-text font-semibold text-sm py-3.5 rounded-full hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            style={{ borderRadius: '100px' }}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-charcoal-text border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{isSignUp ? 'Create account' : 'Log in'}</span>
          </button>
        </form>

        <div className="text-center mt-6 flex flex-col gap-3">
          <p className="text-sm text-ash-gray font-sans">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setErrorText(null);
                onNavigate(isSignUp ? '/login' : '/signup');
              }}
              className="font-semibold text-charcoal-text hover:underline underline-offset-4 cursor-pointer"
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </button>
          </p>

          {isSignUp && (
            <p className="text-[11px] text-cloud-gray leading-tight font-sans">
              By creating an account you agree to our{' '}
              <button onClick={() => onNavigate('/terms')} className="underline hover:text-ash-gray cursor-pointer">Terms of Service</button>{' '}
              and{' '}
              <button onClick={() => onNavigate('/privacy')} className="underline hover:text-ash-gray cursor-pointer">Privacy Policy</button>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
