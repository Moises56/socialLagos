export const metadata = {
  title: "Terms of Service | SocialForge",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-slate-300">
      <h1 className="mb-8 text-3xl font-bold text-white">Terms of Service</h1>
      <p className="mb-4 text-sm text-slate-500">Last updated: February 2026</p>

      <section className="space-y-6 leading-relaxed">
        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using SocialForge (&quot;the Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use the
            Service.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">2. Description of Service</h2>
          <p>
            SocialForge is a social media management platform that helps users generate, schedule,
            and publish content across multiple social media platforms including Facebook, Instagram,
            and TikTok. The Service uses artificial intelligence to assist with content creation.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials.
            You agree to provide accurate and complete information when creating your account and
            to update this information as needed.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">4. Third-Party Integrations</h2>
          <p>
            The Service integrates with third-party platforms (Facebook, Instagram, TikTok) through
            their official APIs. By connecting your social media accounts, you authorize SocialForge
            to access and publish content on your behalf according to the permissions you grant.
            You remain responsible for all content published through the Service.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">5. Content Responsibility</h2>
          <p>
            You are solely responsible for the content you create, schedule, and publish through
            the Service. SocialForge does not claim ownership of your content. AI-generated
            suggestions are provided as assistance; you should review all content before publishing.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">6. Data Handling</h2>
          <p>
            We store OAuth tokens in encrypted form to maintain your social media connections.
            We do not sell or share your personal data with third parties except as required to
            provide the Service. See our Privacy Policy for details.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">7. Limitation of Liability</h2>
          <p>
            SocialForge is provided &quot;as is&quot; without warranties of any kind. We are not
            liable for any damages arising from the use of the Service, including but not limited
            to content publishing errors, API downtime, or social media account issues.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the Service
            after changes constitutes acceptance of the new terms.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">9. Contact</h2>
          <p>
            For questions about these Terms of Service, contact us at support@socialforge.app.
          </p>
        </div>
      </section>
    </main>
  );
}
