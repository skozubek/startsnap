/**
 * src/screens/Terms/Terms.tsx
 * @description Terms of Service page for startsnap.fun platform
 */

import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";

/**
 * @description Renders the Terms of Service page with legal terms and conditions
 * @returns {JSX.Element} Terms of Service page content
 */
export const Terms = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <div className="w-full bg-startsnap-candlelight border-b-2 border-gray-800">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-startsnap-ebony-clay text-center font-heading leading-tight">
            Terms of Service
          </h1>
          <div className="text-center mt-6">
            <div className="inline-block bg-startsnap-white px-4 py-2 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937]">
              <span className="text-sm text-startsnap-river-bed">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections with Alternating Backgrounds */}
      <div className="w-full">
        {/* Acceptance of Terms - White Background */}
        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              1. Acceptance of Terms
            </h2>
            <p className="text-startsnap-river-bed leading-relaxed text-lg">
              Welcome to startsnap.fun! By accessing or using our platform, you agree to be bound by these Terms of Service.
              If you disagree with any part of these terms, you may not access or use our service. These terms apply to all
              visitors, users, and others who access or use the service.
            </p>
          </div>
        </section>

        {/* Description of Service - Light Background */}
        <section className="w-full bg-startsnap-athens-gray border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              2. Description of Service
            </h2>
            <p className="text-startsnap-river-bed leading-relaxed text-lg">
              Startsnap.fun is a community platform for "Vibe Coders" - developers and creators who leverage AI and modern
              tools to build projects. Users can showcase their projects ("StartSnaps"), document their building journey
              through "Vibe Logs", share feedback, and connect with peers. Our platform supports both live projects and
              project ideas, fostering a build-in-public community.
            </p>
          </div>
        </section>

        {/* User Accounts - White Background */}
        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              3. User Accounts and Registration
            </h2>
            <ul className="text-startsnap-river-bed leading-relaxed space-y-3 list-disc pl-6 text-lg">
              <li>You must provide accurate and complete information when creating your account</li>
              <li>You are responsible for maintaining the security of your account and password</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>You may not use another person's account without permission</li>
              <li>One person may not maintain more than one account</li>
            </ul>
          </div>
        </section>

        {/* User Content and Conduct - Light Background */}
        <section className="w-full bg-startsnap-french-pass border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-8">
              4. User Content and Conduct
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-startsnap-oxford-blue mb-4">Your Content</h3>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6">
                  <li>You retain ownership of content you post (StartSnaps, Vibe Logs, comments, etc.)</li>
                  <li>By posting content, you grant us a license to display, distribute, and moderate your content</li>
                  <li>You represent that your content doesn't violate any third-party rights</li>
                  <li>You're responsible for backing up your own content</li>
                </ul>
              </div>

              <Separator className="bg-gray-400" />

              <div>
                <h3 className="text-lg font-semibold text-startsnap-oxford-blue mb-4">Prohibited Content</h3>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6">
                  <li>Content that is illegal, harmful, threatening, abusive, or discriminatory</li>
                  <li>Spam, fake content, or misleading information</li>
                  <li>Content that infringes on intellectual property rights</li>
                  <li>Malicious code, viruses, or security exploits</li>
                  <li>Adult content, violence, or other inappropriate material</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Community Guidelines - White Background */}
        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              5. Community Guidelines
            </h2>
            <p className="text-startsnap-river-bed leading-relaxed mb-6 text-lg">
              Our platform thrives on respectful collaboration. We expect all users to:
            </p>
            <ul className="text-startsnap-river-bed leading-relaxed space-y-3 list-disc pl-6 text-lg">
              <li>Provide constructive and honest feedback</li>
              <li>Respect intellectual property and give proper attribution</li>
              <li>Be supportive of fellow creators and their learning journeys</li>
              <li>Share authentic progress and experiences in Vibe Logs</li>
              <li>Report inappropriate content or behavior</li>
            </ul>
          </div>
        </section>

        {/* AI and Tool Usage - Light Background */}
        <section className="w-full bg-startsnap-wisp-pink border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              6. AI and Tool Usage
            </h2>
            <p className="text-startsnap-river-bed leading-relaxed mb-6 text-lg">
              We celebrate the use of AI and modern development tools. When sharing projects that use AI assistance:
            </p>
            <ul className="text-startsnap-river-bed leading-relaxed space-y-3 list-disc pl-6 text-lg">
              <li>Be transparent about your use of AI tools and assistance</li>
              <li>Respect the terms of service of AI platforms and tools you use</li>
              <li>Don't present AI-generated content as entirely your own original work</li>
              <li>Follow applicable laws regarding AI usage and data privacy</li>
            </ul>
          </div>
        </section>

        {/* Platform Usage and Privacy - Dual Column Layout */}
        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-heading mb-4">
                  7. Platform Usage and Limitations
                </h2>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6">
                  <li>Use the platform only for lawful purposes</li>
                  <li>Don't attempt to hack, break, or circumvent our security measures</li>
                  <li>Don't scrape or automatically collect data from our platform</li>
                  <li>Don't interfere with other users' access or experience</li>
                  <li>Respect rate limits and technical restrictions</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-heading mb-4">
                  8. Privacy and Data Protection
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect,
                  use, and protect your personal information. By using our service, you consent to our privacy practices.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-startsnap-athens-gray border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-heading mb-4">
                  9. Termination
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed">
                  We may terminate or suspend your access to our service immediately, without prior notice, for conduct
                  that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
                  You may also terminate your account at any time by contacting us.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-heading mb-4">
                  10. Disclaimers and Limitation of Liability
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed">
                  Our service is provided "as is" without warranties of any kind. We are not liable for any indirect,
                  incidental, special, consequential, or punitive damages resulting from your use of the service.
                  This includes damages for loss of profits, data, or other intangible losses.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-heading mb-4">
                  11. Changes to Terms
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes
                  by posting the new terms on our platform. Your continued use of the service after changes constitutes
                  acceptance of the new terms.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-heading mb-4">
                  12. Contact Information
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us through our platform
                  or reach out via our social media channels listed on our website.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section - Final Section */}
        <section className="w-full bg-startsnap-french-pass">
          <div className="max-w-4xl mx-auto px-8 py-16">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
                Questions or Concerns?
              </h2>
              <p className="text-startsnap-river-bed leading-relaxed mb-8 text-lg max-w-2xl mx-auto">
                We're here to help clarify any questions about these terms. Reach out through our platform
                or connect with us on social media.
              </p>

              <div className="bg-startsnap-white p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] max-w-2xl mx-auto">
                <p className="text-sm text-startsnap-river-bed">
                  By using startsnap.fun, you acknowledge that you have read and understood these Terms of Service
                  and agree to be bound by them.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};