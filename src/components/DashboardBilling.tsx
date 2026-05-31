import React, { useState } from 'react';
import { useAppState } from '../state';
import { Check, ShieldAlert, CreditCard, LayoutGrid, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { PlanType } from '../types';

export const DashboardBilling: React.FC = () => {
  const {
    subscription,
    selectPlan,
    openBillingPortal,
    startStripeCheckout,
    addToast
  } = useAppState();

  const isFree = subscription?.plan === 'free';
  const isPastDue = subscription?.status === 'past_due';

  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    await openBillingPortal();
    setLoading(false);
  };

  const handleUpgrade = async (plan: PlanType) => {
    setLoading(true);
    if (plan === 'free') {
      await selectPlan(plan, false);
    } else {
      await startStripeCheckout(plan, 'monthly', 1);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-10 font-sans text-charcoal-text text-left selection:bg-sage-green selection:text-charcoal-text relative">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-1 text-charcoal-text">
          Billing & subscription
        </h1>
        <p className="text-sm text-ash-gray font-sans font-medium">
          Manage your subscription plans, intervals, invoices, and billing history.
        </p>
      </div>

      {/* CURRENT ACTIVE PLAN DETAIL CARD FRAME */}
      <div className="bg-canvas-white border border-whisper-gray rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm relative overflow-hidden">
        {/* Top edge borders indicator */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isPastDue ? 'bg-red-500' : isFree ? 'bg-whisper-gray' : 'bg-sage-green'}`} />

        {/* Warning if past due payments failed */}
        {isPastDue && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-xs font-semibold leading-relaxed flex gap-2.5 items-start">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div>
              <span>⚠️ Your last recursive payment failed!</span>
              <p className="font-sans font-normal text-red-600 mt-0.5 leading-normal">
                Please update your credit card or billing profile in the Stripe portal to keep your daily scheduled runs active.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cloud-gray font-bold">ACTIVE SUBSCRIPTION</span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-serif text-2xl font-semibold capitalize text-charcoal-text">{subscription?.plan || 'Free'} Plan</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                isPastDue
                  ? 'bg-red-100 text-red-600 border border-red-200'
                  : isFree
                  ? 'bg-parchment text-ash-gray border border-whisper-gray'
                  : 'bg-sage-green/[0.24] text-charcoal-text border border-sage-green/35'
              }`}>
                {isPastDue ? 'Past Due ⚠️' : isFree ? 'Forever Free' : 'Active'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isFree ? (
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={loading}
                className="bg-sage-green text-charcoal-text font-bold text-xs py-3.5 px-6 rounded-full hover:opacity-90 shadow-sm cursor-pointer disabled:opacity-50"
                style={{ borderRadius: '100px' }}
              >
                Upgrade to Pro — $5 / mo
              </button>
            ) : (
              <button
                onClick={handleManageBilling}
                className="bg-canvas-white border border-cloud-gray hover:bg-parchment text-charcoal-text text-sm font-semibold py-3 px-5 transition-all text-center rounded-full flex items-center gap-1.5 shadow-sm"
                style={{ borderRadius: '100px' }}
              >
                <span>Manage billing</span>
                <ExternalLink size={13} />
              </button>
            )}
          </div>
        </div>

        <hr className="border-whisper-gray" />

        {/* Plan meta grids descriptions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans text-xs text-ash-gray">
          <div className="flex flex-col gap-1">
            <span className="text-cloud-gray font-mono font-semibold uppercase tracking-wider text-[10px]">Billed interval</span>
            <span className="font-semibold text-charcoal-text capitalize text-xs">
              {isFree ? 'Not applicable' : `Billed ${subscription?.interval || 'monthly'}`}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-cloud-gray font-mono font-semibold uppercase tracking-wider text-[10px]">Period Renewal Limit</span>
            <span className="font-semibold text-charcoal-text text-xs">
              {isFree ? 'Never expires' : new Date(subscription?.current_period_end || '').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-cloud-gray font-mono font-semibold uppercase tracking-wider text-[10px]">Seats Included</span>
            <span className="font-semibold text-charcoal-text text-xs">
              {subscription?.plan === 'team' ? '5 seats included' : '1 seat'}
            </span>
          </div>
        </div>
      </div>

      {/* PLAN COMPARISONS TABLE LIST DETAILS */}
      <div className="flex flex-col gap-5 mt-4">
        <h3 className="font-serif text-lg font-semibold text-charcoal-text">Compare Plans & Configurations</h3>

        <div className="bg-canvas-white border border-whisper-gray rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left font-sans text-xs text-ash-gray leading-normal border-collapse">
            <thead>
              <tr className="bg-parchment/60 border-b border-whisper-gray font-mono font-bold tracking-wider text-[10px] text-cloud-gray uppercase">
                <th className="py-4.5 px-6">Core Benefit Items</th>
                <th className="py-4.5 px-4">Free Plan</th>
                <th className="py-4.5 px-4">Pro Plan</th>
                <th className="py-4.5 px-4">Team Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-whisper-gray/40">
              <tr>
                <td className="py-4 px-6 font-semibold text-charcoal-text">Daily Compiling</td>
                <td className="py-4 px-4">Manual click only</td>
                <td className="py-4 px-4 text-charcoal-text font-semibold">Scheduled automatic</td>
                <td className="py-4 px-4 text-charcoal-text font-semibold">Scheduled automatic</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-charcoal-text font-sans">Databases Pulled</td>
                <td className="py-4 px-4 text-ash-gray">Limit 1 DB</td>
                <td className="py-4 px-4 text-charcoal-text">Up to 3 databases maps</td>
                <td className="py-4 px-4 text-charcoal-text font-semibold">Fully Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-charcoal-text">Templates designer</td>
                <td className="py-4 px-4 text-cloud-gray">Locked (Built-in only)</td>
                <td className="py-4 px-4 text-charcoal-text">Custom builder - limit 10</td>
                <td className="py-4 px-4 text-charcoal-text font-semibold">Shared team layouts</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-charcoal-text">Compiling Log Retention</td>
                <td className="py-4 px-4 text-ash-gray">30 days</td>
                <td className="py-4 px-4 text-charcoal-text">Unlimited History</td>
                <td className="py-4 px-4 text-charcoal-text font-semibold">Full logs + Audit logs</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-charcoal-text">Seats Allocated</td>
                <td className="py-4 px-4">1 Member</td>
                <td className="py-4 px-4">1 Member</td>
                <td className="py-4 px-4 text-charcoal-text font-semibold">5 Seats (+ $5/seat)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* DANGER BILLING portal invoices */}
      <section className="bg-canvas-white border border-whisper-gray rounded-2xl p-6 md:p-8 flex flex-col gap-4 mt-2">
        <h4 className="font-serif text-base font-semibold text-charcoal-text">Invoices & Billing Statements</h4>
        <p className="text-xs text-ash-gray leading-normal max-w-xl">
          View historic credit card invoices, change payment methods, update taxation markers, or cancel recursive subscriptions anytime inside Stripe safe portals.
        </p>
        <button
          onClick={handleManageBilling}
          className="bg-parchment text-charcoal-text hover:bg-whisper-gray transition-colors text-xs font-bold py-3 px-6 rounded-full w-fit mt-1 shadow-sm"
          style={{ borderRadius: '100px' }}
        >
          <span>Open Stripe Customer Portal</span>
        </button>
      </section>
    </div>
  );
};
export default DashboardBilling;
