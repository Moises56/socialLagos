export const metadata = {
  title: "Privacy Policy | SocialForge",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-slate-300">
      <h1 className="mb-8 text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mb-4 text-sm text-slate-500">Last updated: February 2026</p>

      <section className="space-y-6 leading-relaxed">
        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Account information:</strong> name, email address, and encrypted password
              when you register.
            </li>
            <li>
              <strong>Social media data:</strong> when you connect your social media accounts
              (Facebook, Instagram, TikTok), we receive OAuth tokens and basic profile information
              (username, profile picture, follower counts).
            </li>
            <li>
              <strong>Content data:</strong> content you create, schedule, or publish through our
              platform.
            </li>
            <li>
              <strong>Usage data:</strong> how you interact with our Service, including features
              used and content generated.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Provide and improve the Service</li>
            <li>Publish content to your connected social media accounts on your behalf</li>
            <li>Generate AI-assisted content suggestions</li>
            <li>Display analytics and monetization progress</li>
            <li>Communicate with you about your account</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">3. Data Security</h2>
          <p>
            We take data security seriously. All social media OAuth tokens are encrypted using
            AES-256-GCM encryption before storage. Passwords are hashed using bcrypt with a cost
            factor of 12. All data is transmitted over HTTPS.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">4. Third-Party Services</h2>
          <p>We integrate with the following third-party services:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Meta (Facebook/Instagram):</strong> to manage and publish content to your
              Facebook Pages and Instagram Business accounts.
            </li>
            <li>
              <strong>TikTok:</strong> to manage and publish video content to your TikTok account.
            </li>
            <li>
              <strong>Cloudinary:</strong> for secure media file storage and processing.
            </li>
            <li>
              <strong>MongoDB Atlas:</strong> for secure database hosting.
            </li>
            <li>
              <strong>AI providers (Groq, DeepSeek, Google Gemini):</strong> for content generation.
              We do not send your personal data to AI providers; only content generation prompts.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">5. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. You can request deletion
            of your account and associated data at any time by contacting us. Social media tokens
            are revoked upon account disconnection.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Disconnect social media accounts at any time</li>
            <li>Export your content data</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">7. Data Sharing</h2>
          <p>
            We do not sell your personal data. We only share data with third-party services as
            described above and as necessary to provide the Service. We may disclose data if
            required by law.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">8. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use
            tracking or advertising cookies.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes via email or through the Service.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold text-white">10. Contact</h2>
          <p>
            For questions about this Privacy Policy or to exercise your data rights, contact us
            at privacy@socialforge.app.
          </p>
        </div>
      </section>
    </main>
  );
}
