import React, { useState } from 'react';
import { Calendar, Puzzle, ChevronDown, Check, ArrowRight, Notebook } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [isYearly, setIsYearly] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: "Does this work with any Notion workspace?",
      a: "Yes. As long as you have a Notion account with at least one database for tasks and one for journals, DailyNotion works with any setup."
    },
    {
      q: "Do I need to know how to use Notion's relations or APIs?",
      a: "Not at all. DailyNotion handles all the complexity. You just click 'Connect' and choose which databases to use."
    },
    {
      q: "What happens if I'm on the Free plan and want to upgrade?",
      a: "Go to your billing settings at any time and upgrade in one click. Your data and templates carry over seamlessly."
    },
    {
      q: "Is my Notion data safe?",
      a: "We only read the databases you explicitly choose. We never store the content of your tasks or notes on our servers — only the metadata needed to run the scheduler."
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. Cancel from your billing settings under your profile. No hidden exit fees, no tedious refund loops."
    }
  ];

  return (
    <div className="bg-canvas-white text-charcoal-text font-sans antialiased selection:bg-sage-green selection:text-charcoal-text min-h-screen">
      {/* Navigation Header */}
      <nav id="landing-navbar" className="sticky top-0 z-40 bg-canvas-white/94 backdrop-blur-md border-b border-whisper-gray px-4 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => onNavigate('/')}>
          <span className="font-sans font-bold text-lg text-charcoal-text tracking-tight">DailyNotion</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => handleScroll('features')} className="text-ash-gray hover:text-charcoal-text font-sans text-sm font-medium hover:underline decoration-sage-green decoration-2 underline-offset-4 transition-colors cursor-pointer">
            Features
          </button>
          <button onClick={() => handleScroll('how-it-works')} className="text-ash-gray hover:text-charcoal-text font-sans text-sm font-medium hover:underline decoration-sage-green decoration-2 underline-offset-4 transition-colors cursor-pointer">
            How It Works
          </button>
          <button onClick={() => handleScroll('pricing')} className="text-ash-gray hover:text-charcoal-text font-sans text-sm font-medium hover:underline decoration-sage-green decoration-2 underline-offset-4 transition-colors cursor-pointer">
            Pricing
          </button>
        </div>

        <div className="flex items-center gap-5">
          <button 
            onClick={() => onNavigate('/login')} 
            className="text-ash-gray hover:text-charcoal-text font-sans text-sm font-medium transition-colors cursor-pointer"
          >
            Log in
          </button>
          <button
            onClick={() => onNavigate('/signup')}
            className="bg-sage-green text-charcoal-text text-sm font-semibold tracking-wide py-2.5 px-6 rounded-full hover:opacity-90 transition-all cursor-pointer"
            style={{ borderRadius: '100px' }}
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 md:px-12 py-20 md:py-28 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-parchment border border-whisper-gray px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-ash-gray uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-green animate-ping" />
          <span>Automated Daily Pages</span>
        </div>
        
        <h1 className="font-serif text-[40px] md:text-[56px] leading-[1.08] tracking-tight font-medium text-charcoal-text max-w-4xl mb-6">
          Your Notion journal, written for you — <span className="bg-zenith-blue/40 px-2 py-0.5 rounded">every morning.</span>
        </h1>
        
        <p className="font-sans text-[16px] md:text-[18px] leading-[1.4] text-ash-gray max-w-2xl mb-10">
          DailyNotion automatically creates your daily journal page in Notion and fills it with today's tasks, meetings, and notes. Wake up. Open Notion. It's already done.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <button
            onClick={() => onNavigate('/signup')}
            className="w-full sm:w-auto bg-sage-green text-charcoal-text font-semibold text-base px-8 py-3.5 hover:opacity-90 transition-all shadow-sm cursor-pointer"
            style={{ borderRadius: '100px' }}
          >
            Get started free
          </button>
          <button
            onClick={() => handleScroll('features')}
            className="w-full sm:w-auto bg-canvas-white border border-whisper-gray px-8 py-3.5 rounded-full font-medium text-[16px] text-ash-gray hover:bg-parchment hover:text-charcoal-text transition-all cursor-pointer"
            style={{ borderRadius: '100px' }}
          >
            See how it works
          </button>
        </div>

        <p className="text-xs text-cloud-gray tracking-wide font-medium mt-1 font-sans">
          No credit card required. Free plan available.
        </p>

        {/* Hero Product Mockup Preview */}
        <div className="w-full mt-16 border border-whisper-gray bg-parchment p-4 md:p-8 rounded-2xl max-w-4xl text-left shadow-sm">
          <div className="bg-canvas-white rounded-xl border border-cloud-gray p-6 font-sans flex flex-col gap-5 text-sm">
            <div className="flex items-center gap-2 border-b border-whisper-gray pb-4">
              <span className="text-xl">🌿</span>
              <div className="flex flex-col">
                <span className="font-semibold text-charcoal-text text-base">May 28, 2026 — Daily Review</span>
                <span className="text-xs text-ash-gray">Created by DailyNotion Scheduler at 08:00 AM EST</span>
              </div>
            </div>
            
            <div>
              <span className="text-xs font-bold text-ash-gray tracking-widest uppercase font-mono block mb-2">⚡ ACTIVE TASKS DUE TODAY</span>
              <div className="flex flex-col gap-2 pl-1">
                <div className="flex items-center gap-2.5 text-charcoal-text">
                  <input type="checkbox" readOnly checked className="accent-sage-green" />
                  <span className="line-through text-ash-gray">Finalize roadmap deck for alden.health launch</span>
                </div>
                <div className="flex items-center gap-2.5 text-charcoal-text">
                  <input type="checkbox" readOnly className="accent-sage-green" />
                  <span>Review therapeutic data validation parameters</span>
                </div>
                <div className="flex items-center gap-2.5 text-charcoal-text">
                  <input type="checkbox" readOnly className="accent-sage-green" />
                  <span>Connect workspace token for backup staging</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-ash-gray tracking-widest uppercase font-mono block mb-2">📝 CAPTURED NOTES (LAST 24 HOURS)</span>
              <div className="bg-parchment p-3 rounded-lg border border-whisper-gray flex flex-col gap-2 text-xs">
                <div>
                  <span className="font-semibold text-charcoal-text">Clinical validation parameters:</span>
                  <p className="text-ash-gray">Need to confirm safety limits for sensor data integration in v2 schemas.</p>
                </div>
                <div className="border-t border-whisper-gray pt-2">
                  <span className="font-semibold text-charcoal-text">Product Ideation:</span>
                  <p className="text-ash-gray">Provide configurable database checkboxes to control which tags sync daily.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid ("Everything you need. Nothing you don't.") */}
      <section id="features" className="bg-parchment py-24 px-4 md:px-12 border-y border-whisper-gray scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold font-mono text-ash-gray block mb-2">FEATURES</span>
            <h2 className="font-serif text-3xl md:text-[40px] leading-tight font-medium text-charcoal-text">
              Everything you need. Nothing you don't.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-canvas-white border border-whisper-gray rounded-2xl p-10 flex flex-col gap-4 text-left transition-all">
              <div className="w-10 h-10 rounded-full bg-parchment flex items-center justify-center text-charcoal-text">
                <Calendar size={20} className="text-ash-gray" />
              </div>
              <h3 className="text-lg font-semibold tracking-wide text-charcoal-text">Auto-generated daily pages</h3>
              <p className="text-sm text-ash-gray leading-relaxed">
                Every morning at your chosen time, DailyNotion creates a fresh journal page in your Notion workspace — titled, dated, and ready to go.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-canvas-white border border-whisper-gray rounded-2xl p-10 flex flex-col gap-4 text-left transition-all">
              <div className="w-10 h-10 rounded-full bg-parchment flex items-center justify-center text-charcoal-text">
                <Notebook size={20} className="text-ash-gray" />
              </div>
              <h3 className="text-lg font-semibold tracking-wide text-charcoal-text">Pulls your real data</h3>
              <p className="text-sm text-ash-gray leading-relaxed">
                Tasks due today, notes from the last 24 hours, and upcoming meetings are automatically pulled from your Notion databases and dropped into the page.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-canvas-white border border-whisper-gray rounded-2xl p-10 flex flex-col gap-4 text-left transition-all">
              <div className="w-10 h-10 rounded-full bg-parchment flex items-center justify-center text-charcoal-text">
                <Puzzle size={20} className="text-ash-gray" />
              </div>
              <h3 className="text-lg font-semibold tracking-wide text-charcoal-text">Your template, your way</h3>
              <p className="text-sm text-ash-gray leading-relaxed">
                Design your own journal layout using simple placeholders like <code className="font-mono bg-parchment text-charcoal-text text-xs px-1 py-0.5 rounded">{"{{tasks_today}}"}</code> and <code className="font-mono bg-parchment text-charcoal-text text-xs px-1 py-0.5 rounded">{"{{notes_last_24h}}"}</code>. We fill them in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (Numbered Vertical List) */}
      <section id="how-it-works" className="py-24 px-4 md:px-12 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold font-mono text-ash-gray block mb-2">FLOW</span>
            <h2 className="font-serif text-3xl md:text-[40px] leading-tight font-medium text-charcoal-text">
              Set up in 3 minutes.
            </h2>
          </div>

          <div className="flex flex-col gap-12">
            {[
              {
                step: "1",
                title: "Sign up and connect your Notion",
                desc: "One click. We use Notion's official secure OAuth integration — we never store your data inside Notion."
              },
              {
                step: "2",
                title: "Select your databases",
                desc: "Tell us which Notion database contains your active tasks and where to create your journal pages."
              },
              {
                step: "3",
                title: "Pick a template",
                desc: "Choose from our pre-built layouts or build your own with custom placeholders."
              },
              {
                step: "4",
                title: "Set your schedule",
                desc: "Choose a time. We'll generate your journal every morning at exactly that time in your timezone."
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="w-10 h-10 shrink-0 font-sans font-bold text-base rounded-full bg-parchment flex items-center justify-center border border-whisper-gray text-charcoal-text">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-text mb-1 tracking-wide">{item.title}</h3>
                  <p className="text-sm text-ash-gray leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section ("Simple pricing. No surprises.") */}
      <section id="pricing" className="bg-parchment py-24 px-4 md:px-12 border-y border-whisper-gray scroll-mt-20">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs uppercase tracking-widest font-semibold font-mono text-ash-gray block mb-2">PRICING</span>
          <h2 className="font-serif text-3xl md:text-[40px] leading-tight font-medium text-charcoal-text mb-3">
            Simple pricing. No surprises.
          </h2>
          <p className="text-sm text-ash-gray font-medium mb-12">
            Start free. Upgrade when you're ready.
          </p>

          {/* Pricing Toggle */}
          <div className="inline-flex items-center gap-3 bg-canvas-white p-1 rounded-full border border-whisper-gray mb-16">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider cursor-pointer transition-all ${
                !isYearly ? 'bg-charcoal-text text-canvas-white' : 'text-ash-gray hover:text-charcoal-text'
              }`}
              style={{ borderRadius: '100px' }}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider cursor-pointer flex items-center gap-1.5 transition-all ${
                isYearly ? 'bg-charcoal-text text-canvas-white' : 'text-ash-gray hover:text-charcoal-text'
              }`}
              style={{ borderRadius: '100px' }}
            >
              <span>Yearly billing</span>
              <span className="bg-sage-green text-charcoal-text text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Save 20%</span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="bg-canvas-white border border-whisper-gray rounded-2xl p-10 flex flex-col gap-6 text-left relative">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-ash-gray font-mono">Starter Tier</span>
                <h3 className="text-2xl font-semibold text-charcoal-text tracking-wide mt-1">Free</h3>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-medium">$0</span>
                <span className="text-ash-gray text-xs">/ forever</span>
              </div>
              
              <button
                onClick={() => onNavigate('/signup')}
                className="w-full text-center bg-canvas-white border border-cloud-gray hover:bg-parchment text-charcoal-text text-sm font-semibold tracking-wide py-3 rounded-full transition-all cursor-pointer"
                style={{ borderRadius: '100px' }}
              >
                Get started free casting
              </button>

              <hr className="border-whisper-gray" />

              <ul className="flex flex-col gap-3.5 text-sm text-ash-gray leading-relaxed">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>Manual generation only</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>1 pre-built template</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>Pull from 1 database</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>30-day journal history</span>
                </li>
              </ul>
            </div>

            {/* Pro - Most Popular */}
            <div className="bg-canvas-white border-2 border-sage-green rounded-2xl p-10 flex flex-col gap-6 text-left relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sage-green text-charcoal-text text-[10px] font-bold tracking-widest uppercase px-3.5 py-1 rounded-full">
                Most Popular
              </span>
              
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-ash-gray font-mono">Individual Pro</span>
                <h3 className="text-2xl font-semibold text-charcoal-text tracking-wide mt-1">Pro</h3>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-medium">
                  {isYearly ? '$3.75' : '$5'}
                </span>
                <span className="text-ash-gray text-xs">
                  {isYearly ? '/ month, billed $45 annually' : '/ month'}
                </span>
              </div>
              
              <button
                onClick={() => onNavigate('/signup')}
                className="w-full text-center bg-sage-green text-charcoal-text text-sm font-semibold tracking-wide py-3 rounded-full hover:opacity-90 transition-all cursor-pointer"
                style={{ borderRadius: '100px' }}
              >
                Start Pro Account
              </button>

              <hr className="border-whisper-gray" />

              <ul className="flex flex-col gap-3.5 text-sm text-ash-gray leading-relaxed">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <strong>Scheduled daily generation</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>Pull from up to 3 databases</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <strong>Custom template builder</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>Email notification when ready</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>Save up to 10 templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>Full journal history logs</span>
                </li>
              </ul>
            </div>

            {/* Team */}
            <div className="bg-canvas-white border border-whisper-gray rounded-2xl p-10 flex flex-col gap-6 text-left relative">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-ash-gray font-mono">Workplace Teams</span>
                <h3 className="text-2xl font-semibold text-charcoal-text tracking-wide mt-1">Team</h3>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-medium">
                  {isYearly ? '$11.25' : '$15'}
                </span>
                <span className="text-ash-gray text-xs">
                  {isYearly ? '/ month, billed $135 annually' : '/ month, for 5 seats'}
                </span>
              </div>
              
              <button
                onClick={() => onNavigate('/signup')}
                className="w-full text-center bg-canvas-white border border-cloud-gray hover:bg-parchment text-charcoal-text text-sm font-semibold tracking-wide py-3 rounded-full transition-all cursor-pointer"
                style={{ borderRadius: '100px' }}
              >
                Start Team Workspace
              </button>

              <hr className="border-whisper-gray" />

              <ul className="flex flex-col gap-3.5 text-sm text-ash-gray leading-relaxed">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <strong>Everything in Pro for all members</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>Shared team templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>Admin permissions panel</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>Audit logs compliance log</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-sage-green shrink-0" />
                  <span>Priority support 24/7</span>
                </li>
                <li className="flex items-center gap-2 text-xs font-semibold text-ash-gray font-mono">
                  <span>* extra seats is $5/seat/month</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 md:px-12 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold font-mono text-ash-gray block mb-2">HELP</span>
          <h2 className="font-serif text-3xl md:text-[40px] leading-tight font-medium text-charcoal-text">
            Questions? We've got answers.
          </h2>
        </div>

        <div className="flex flex-col border-t border-whisper-gray">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-whisper-gray py-5">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer"
              >
                <span className="font-sans font-semibold text-base text-charcoal-text group-hover:text-ash-gray transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-ash-gray transition-transform duration-300 ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedFaq === index ? 'max-h-48 mt-3 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm font-sans text-ash-gray leading-relaxed pr-6">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-text text-cloud-gray border-t border-cloud-gray/20 py-16 px-4 md:px-12 font-sans">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex items-center" onClick={() => onNavigate('/')}>
            <span className="font-bold text-lg text-canvas-white tracking-tight">DailyNotion</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <button onClick={() => handleScroll('features')} className="hover:text-canvas-white transition-colors cursor-pointer">Features</button>
            <button onClick={() => handleScroll('pricing')} className="hover:text-canvas-white transition-colors cursor-pointer">Pricing</button>
            <button onClick={() => onNavigate('/privacy')} className="hover:text-canvas-white transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => onNavigate('/terms')} className="hover:text-canvas-white transition-colors cursor-pointer">Terms of Service</button>
          </div>

          <div className="text-[12px] text-ash-gray">
            © 2025 DailyNotion. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
