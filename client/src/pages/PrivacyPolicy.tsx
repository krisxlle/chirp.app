import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="p-2 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: January 19, 2025</p>

          <div className="prose dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This Privacy Policy describes how Chirp ("we," "our," or "us") collects, uses, and shares 
                information about you when you use our social media platform and related services (the "Service").
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Information You Provide</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
                <li>Account information (email, name, profile details)</li>
                <li>Content you post (chirps, comments, reactions)</li>
                <li>Messages and communications</li>
                <li>Payment information (processed securely by third parties)</li>
                <li>Feedback and correspondence</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Information We Collect Automatically</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Usage data (how you interact with the Service)</li>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Location data (general geographic location)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Analytics data to improve our Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and administrative messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Generate AI-powered content and recommendations</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent or illegal activities</li>
                <li>Personalize and improve your experience</li>
                <li>Send promotional communications (with your consent)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">AI-Powered Data Processing</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                We use artificial intelligence extensively throughout our Service, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Analyzing your content, interactions, and preferences to generate personalized profiles</li>
                <li>Creating AI-generated avatars, banners, bios, and interest recommendations</li>
                <li>Processing your posts and engagement patterns for weekly analytics and insights</li>
                <li>Generating viral potential scores and growth recommendations</li>
                <li>Improving AI models through aggregated, anonymized usage data</li>
                <li>Providing content moderation and safety features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                We may share information about you in the following situations:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>With other users as part of the social features of the Service</li>
                <li>With service providers who perform services on our behalf</li>
                <li>For legal reasons, such as to comply with legal process</li>
                <li>To protect our rights, property, or safety and that of others</li>
                <li>In connection with a merger, sale, or other business transfer</li>
                <li>With your consent or at your direction</li>
                <li>In aggregated or de-identified form that cannot reasonably identify you</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Third-Party Services and AI Processing</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our Service integrates with third-party services including:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mt-3 mb-4">
                <li>Payment processors (Stripe) for subscription processing</li>
                <li>AI services (OpenAI) for content generation and analysis</li>
                <li>Email services (Mailchimp) for communications</li>
                <li>Authentication providers (Replit) for account management</li>
                <li>Analytics services for usage tracking</li>
              </ul>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">AI Service Data Processing</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                When using AI features, your data may be processed by external AI services:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
                <li>Your content and preferences may be sent to AI services for processing</li>
                <li>We do not allow third-party AI services to train on your personal data</li>
                <li>AI processing is done on a request basis and not stored by third parties</li>
                <li>We implement safeguards to protect your data during AI processing</li>
                <li>You can opt out of AI features through your account settings</li>
              </ul>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These third parties have their own privacy policies and may collect information about you 
                when you use their services through our platform. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We implement appropriate security measures to protect your information against unauthorized 
                access, alteration, disclosure, or destruction. However, no method of transmission over the 
                internet or electronic storage is 100% secure. While we strive to protect your information, 
                we cannot guarantee absolute security.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                <strong>Data Breach Notification:</strong> In the event of a data breach that affects your 
                personal information, we will notify you and relevant authorities as required by applicable law, 
                typically within 72 hours of becoming aware of the breach.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Data Retention</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We retain your information for as long as necessary to provide the Service and fulfill the 
                purposes outlined in this Privacy Policy. We may also retain information to comply with legal 
                obligations, resolve disputes, and enforce agreements. When we no longer need your information, 
                we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Your Rights and Choices</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Access: Request a copy of the personal information we hold about you</li>
                <li>Correction: Request correction of inaccurate or incomplete information</li>
                <li>Deletion: Request deletion of your personal information</li>
                <li>Portability: Request transfer of your information to another service</li>
                <li>Restriction: Request that we limit how we use your information</li>
                <li>Objection: Object to our use of your information for certain purposes</li>
                <li>Withdraw consent: Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                To exercise these rights, please contact us at privacy@chirp.app.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian and believe your 
                child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. These 
                countries may have different data protection laws. We ensure appropriate safeguards are in place 
                to protect your information when it is transferred internationally.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Cookies and Tracking</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We use cookies and similar tracking technologies to collect information about your browsing 
                activities. You can control cookies through your browser settings, but disabling cookies may 
                affect the functionality of our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. If we make material changes, we will 
                notify you by email or through the Service before the changes take effect. Your continued 
                use of the Service after the effective date constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-3 text-gray-700 dark:text-gray-300">
                <p>Email: privacy@chirp.app</p>
                <p>Legal Department: legal@chirp.app</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}