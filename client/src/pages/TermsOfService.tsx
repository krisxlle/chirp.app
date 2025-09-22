import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";

export default function TermsOfService() {
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: January 19, 2025</p>

          <div className="prose dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By accessing or using Chirp ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Chirp is a social media platform that allows users to share short messages, follow other users, 
                and engage with content through reactions and replies. The Service may include AI-generated content 
                and premium features available through subscription.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Accounts and Registration</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. User Content and Conduct</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                You are solely responsible for content you post on Chirp. You agree not to post content that:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Is illegal, harmful, threatening, abusive, or defamatory</li>
                <li>Violates intellectual property rights</li>
                <li>Contains spam, malware, or phishing attempts</li>
                <li>Impersonates others or misrepresents your identity</li>
                <li>Harasses or bullies other users</li>
                <li>Contains hate speech or discriminatory content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Intellectual Property Rights</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You retain ownership of content you create and post on Chirp. By posting content, you grant us a 
                worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, 
                publish, transmit, display, and distribute your content in connection with the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Premium Services and Payments</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Chirp+ premium features are available through subscription. Payments are processed securely through 
                third-party payment processors. Subscriptions automatically renew unless cancelled. Refunds are 
                subject to our refund policy and applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. AI-Generated Content and Usage</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Our Service extensively uses artificial intelligence for content generation, user profiling, and personalization features.
              </p>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">AI Content Generation</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
                <li>Profile pictures, banners, bios, and interests may be generated using AI models</li>
                <li>Weekly summaries and analytics insights are powered by AI analysis</li>
                <li>Content recommendations and viral potential scoring use AI algorithms</li>
                <li>AI-generated content is provided "as is" without warranties of accuracy</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">User Data and AI Training</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                By using our Service, you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
                <li>Your content, interactions, and usage patterns may be analyzed by AI systems</li>
                <li>Aggregated, anonymized data may be used to improve AI models and service quality</li>
                <li>Personal data will not be sold or used to train external AI models without consent</li>
                <li>You retain ownership of your original content but grant us rights to process it through AI systems</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">AI Limitations and Disclaimers</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>AI-generated content may contain inaccuracies, biases, or inappropriate material</li>
                <li>Users are responsible for verifying AI-generated content before relying on it</li>
                <li>We disclaim liability for any harm resulting from AI-generated content</li>
                <li>AI features may be temporarily unavailable due to service limitations or costs</li>
                <li>Premium AI features require active Chirp+ subscription and may have usage limits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Data Security and Breach Limitation</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                While we implement reasonable security measures to protect user data, no system is completely secure. 
                In the event of a data breach, our liability is limited to the maximum extent permitted by law. 
                Users acknowledge that they use the Service at their own risk regarding data security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CHIRP SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, 
                USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Disclaimers</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM 
                ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                AND NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Termination</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for any reason, including breach of these Terms. Upon termination, your right to use the Service 
                will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">12. Governing Law</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                where Chirp operates, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. If we make material changes, we will 
                notify users through the Service or by email. Continued use of the Service after changes 
                constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">14. Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at legal@joinchirp.org.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
