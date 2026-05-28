import React from 'react';
import { ShieldCheck, ArrowLeft, GraduationCap } from 'lucide-react';

interface StaticPageProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<StaticPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-canvas-white text-charcoal-text font-sans selection:bg-sage-green selection:text-charcoal-text py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-ash-gray hover:text-charcoal-text transition-colors text-sm mb-12 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>

        <header className="mb-12 border-b border-whisper-gray pb-8">
          <div className="flex items-center gap-3 text-ash-gray mb-4">
            <ShieldCheck size={24} className="text-sage-green" />
            <span className="text-xs uppercase tracking-widest font-semibold font-mono">BUREAU COMPLIANCE</span>
          </div>
          <h1 className="font-serif text-[40px] leading-tight tracking-tight font-medium mb-3">
            Privacy Policy
          </h1>
          <p className="text-ash-gray text-sm">
            Last updated: <span className="font-mono">January 1, 2025</span>
          </p>
        </header>

        <section className="prose prose-slate max-w-none flex flex-col gap-6 text-[16px] leading-[1.6] text-ash-gray font-sans">
          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">1. Who we are</h2>
            <p className="mb-4">
              DailyNotion ("we", "us", "our") is a web application that automates the creation of daily journal pages in Notion. We are operated as an independent SaaS product.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">2. What information we collect</h2>
            <p className="mb-3">We collect the following information when you use DailyNotion:</p>
            <ul className="list-disc list-inside pl-4 flex flex-col gap-2">
              <li>
                <strong className="text-charcoal-text">Account information:</strong> Your name, email address, and encrypted password when you sign up.
              </li>
              <li>
                <strong className="text-charcoal-text">Notion integration data:</strong> Your Notion OAuth access token (encrypted at rest), your Notion workspace ID, and the IDs of the databases you select. We do not store the content of your tasks, notes, or journal pages on our servers — we only read them at the moment of journal generation and write the result directly to your Notion workspace.
              </li>
              <li>
                <strong className="text-charcoal-text">Usage data:</strong> Logs of when your journal was generated, whether generation succeeded or failed, and the count of tasks/notes included. This is used to show you your history dashboard.
              </li>
              <li>
                <strong className="text-charcoal-text">Payment information:</strong> We use Stripe to process payments. We never see or store your card number. Stripe may collect billing information directly.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">3. How we use your information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc list-inside pl-4 flex flex-col gap-1.5">
              <li>Create and manage your account</li>
              <li>Connect to your Notion workspace and generate your journal</li>
              <li>Run your schedule and trigger journal generation at your chosen time</li>
              <li>Send you email notifications (if enabled)</li>
              <li>Process your subscription payments through Stripe</li>
              <li>Provide you with your journal run history</li>
            </ul>
            <p className="mt-3">We do not sell your data to third parties. We do not use your data for advertising.</p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">4. Data storage and security</h2>
            <p>
              Your data is stored in Supabase (PostgreSQL), hosted on secure servers. Your Notion access token is stored encrypted. Passwords are hashed using bcrypt and never stored in plain text. All data transmission uses HTTPS/TLS.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">5. Third-party services</h2>
            <p className="mb-3">DailyNotion uses the following third-party services:</p>
            <ul className="list-disc list-inside pl-4 flex flex-col gap-1">
              <li><strong>Notion API</strong> — to read your databases and create journal pages</li>
              <li><strong>Stripe</strong> — for payment processing</li>
              <li><strong>Resend</strong> — for transactional email (journal ready notifications)</li>
              <li><strong>Supabase</strong> — for database hosting</li>
            </ul>
            <p className="mt-3">Each of these services has their own privacy policy.</p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">6. Your rights</h2>
            <p>
              You may request deletion of your account and all associated data at any time by contacting us at <span className="font-mono underline text-charcoal-text">privacy@dailynotion.app</span>. Upon deletion, we remove your account information, Notion credentials, schedule, and all journal run history from our database within 30 days.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">7. Cookies</h2>
            <p>
              We use minimal cookies necessary for session management. We do not use tracking cookies or advertising cookies.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. We will notify you by email if we make material changes.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">9. Contact</h2>
            <p>
              Questions? Email us at <span className="font-mono text-charcoal-text underline">privacy@dailynotion.app</span>
            </p>
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-whisper-gray text-center text-xs text-cloud-gray">
          © 2025 DailyNotion Inc. All rights reserved. Registered under Alden ecosystem design.
        </footer>
      </div>
    </div>
  );
};

export const TermsOfService: React.FC<StaticPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-canvas-white text-charcoal-text font-sans selection:bg-sage-green selection:text-charcoal-text py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-ash-gray hover:text-charcoal-text transition-colors text-sm mb-12 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>

        <header className="mb-12 border-b border-whisper-gray pb-8">
          <div className="flex items-center gap-3 text-ash-gray mb-4">
            <GraduationCap size={24} className="text-sage-green" />
            <span className="text-xs uppercase tracking-widest font-semibold font-mono">BUREAU COMPLIANCE</span>
          </div>
          <h1 className="font-serif text-[40px] leading-tight tracking-tight font-medium mb-3">
            Terms of Service
          </h1>
          <p className="text-ash-gray text-sm">
            Last updated: <span className="font-mono">January 1, 2025</span>
          </p>
        </header>

        <section className="prose prose-slate max-w-none flex flex-col gap-6 text-[16px] leading-[1.6] text-ash-gray font-sans">
          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">1. Acceptance</h2>
            <p>
              By creating an account and using DailyNotion, you agree to these Terms of Service. If you do not agree, do not use the service.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">2. Description of service</h2>
            <p>
              DailyNotion is a web application that connects to your Notion workspace via OAuth and automatically creates daily journal pages populated with data from your Notion databases. The service is provided "as is."
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">3. Your account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your account. You must be at least 13 years old to use DailyNotion.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">4. Acceptable use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside pl-4 flex flex-col gap-1.5">
              <li>Use DailyNotion to violate any laws or regulations</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service to harass, harm, or defraud others</li>
              <li>Resell or redistribute the service without our written permission</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">5. Notion integration</h2>
            <p>
              When you connect your Notion workspace, you grant DailyNotion permission to read databases you select and create pages in your journal database. You can revoke this permission at any time through your Notion settings or through DailyNotion's settings page. We are not affiliated with or endorsed by Notion Labs, Inc.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">6. Subscription and payments</h2>
            <p>
              Paid subscriptions are billed monthly or annually as selected. Subscriptions renew automatically until cancelled. You may cancel at any time through the billing settings. No refunds are provided for partial billing periods. If payment fails, your account will be downgraded to the Free plan after a grace period.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">7. Service availability</h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted service. Scheduled journal generation may occasionally be delayed or fail due to third-party API outages (e.g. Notion API downtime). We are not liable for missed journal generations.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">8. Limitation of liability</h2>
            <p>
              DailyNotion is not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability to you shall not exceed the amount you paid us in the 12 months prior to the claim.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your settings page.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">10. Changes to terms</h2>
            <p>
              We may update these terms from time to time. Continued use of DailyNotion after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-charcoal-text mb-2 tracking-wide">11. Contact</h2>
            <p>
              Questions? Email us at <span className="font-mono text-charcoal-text underline">hello@dailynotion.app</span>
            </p>
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-whisper-gray text-center text-xs text-cloud-gray">
          © 2025 DailyNotion Inc. All rights reserved. Registered under Alden ecosystem design.
        </footer>
      </div>
    </div>
  );
};
