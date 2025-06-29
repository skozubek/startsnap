/**
 * src/screens/Privacy/Privacy.tsx
 * @description Privacy Policy page for startsnap.fun platform
 */

import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";

/**
 * @description Renders the Privacy Policy page with data protection and privacy information
 * @returns {JSX.Element} Privacy Policy page content
 */
export const Privacy = (): JSX.Element => {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <div className="w-full bg-startsnap-candlelight border-b-2 border-gray-800">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-startsnap-ebony-clay text-center font-heading leading-tight">
            Privacy Policy
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
        {/* Introduction - White Background */}
        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              1. Introduction
            </h2>
            <p className="text-startsnap-river-bed leading-relaxed text-lg">
              At startsnap.fun, we respect your privacy and are committed to protecting your personal data. This privacy
              policy explains how we collect, use, store, and protect your information when you use our platform. By using
              our service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>
        </section>

        {/* Information We Collect - Light Background */}
        <section className="w-full bg-startsnap-athens-gray border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-8">
              2. Information We Collect
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-startsnap-oxford-blue mb-4">Account Information</h3>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6">
                  <li>Email address (for account creation and authentication)</li>
                  <li>Username and display name</li>
                  <li>Profile bio and personal information you choose to share</li>
                  <li>Social media links and external website URLs</li>
                  <li>User status and availability preferences</li>
                </ul>
              </div>

              <Separator className="bg-gray-400" />

              <div>
                <h3 className="text-lg font-semibold text-startsnap-oxford-blue mb-4">Content You Create</h3>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6">
                  <li>StartSnap projects (names, descriptions, categories, links)</li>
                  <li>Vibe Log entries (documentation of your building journey)</li>
                  <li>Comments and feedback on other users' projects</li>
                  <li>Tags, tools used, and project metadata</li>
                  <li>Project support interactions (likes/supports)</li>
                </ul>
              </div>

              <Separator className="bg-gray-400" />

              <div>
                <h3 className="text-lg font-semibold text-startsnap-oxford-blue mb-4">Technical Information</h3>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6">
                  <li>IP address and general location information</li>
                  <li>Device type, browser information, and screen resolution</li>
                  <li>Usage patterns and interaction data</li>
                  <li>Session information and authentication tokens</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How We Use Your Information - White Background */}
        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              3. How We Use Your Information
            </h2>
            <ul className="text-startsnap-river-bed leading-relaxed space-y-3 list-disc pl-6 text-lg">
              <li>Provide and maintain our platform services</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Display your public profile and projects to other users</li>
              <li>Enable community features like feedback and project discovery</li>
              <li>Send important service updates and notifications</li>
              <li>Improve our platform based on usage analytics</li>
              <li>Ensure platform security and prevent abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>
        </section>

        {/* Information Sharing - Light Background */}
        <section className="w-full bg-startsnap-french-pass border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-8">
              4. Information Sharing and Public Content
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-startsnap-oxford-blue mb-4">Public Information</h3>
                <p className="text-startsnap-river-bed leading-relaxed mb-4">
                  The following information is public by design and visible to all users:
                </p>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6">
                  <li>Your username, bio, and profile information</li>
                  <li>All StartSnap projects and their details</li>
                  <li>Vibe Log entries and project updates</li>
                  <li>Comments and feedback you provide</li>
                  <li>Project support counts and interactions</li>
                </ul>
              </div>

              <Separator className="bg-gray-400" />

              <div>
                <h3 className="text-lg font-semibold text-startsnap-oxford-blue mb-4">We Do Not Sell Your Data</h3>
                <p className="text-startsnap-river-bed leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share information only in these limited circumstances:
                </p>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6">
                  <li>With your explicit consent</li>
                  <li>To comply with legal requirements or court orders</li>
                  <li>To protect our rights, safety, or the safety of our users</li>
                  <li>With service providers who help us operate our platform (under strict data protection agreements)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Storage and Security - White Background */}
        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              5. Data Storage and Security
            </h2>
            <p className="text-startsnap-river-bed leading-relaxed mb-6 text-lg">
              We use Supabase, a secure database service, to store your data. Our security measures include:
            </p>
            <ul className="text-startsnap-river-bed leading-relaxed space-y-3 list-disc pl-6 mb-6">
              <li>Encrypted data transmission (HTTPS/SSL)</li>
              <li>Secure authentication and session management</li>
              <li>Regular security updates and monitoring</li>
              <li>Access controls and permission-based data access</li>
              <li>Regular backups and data recovery procedures</li>
            </ul>
            <p className="text-startsnap-river-bed leading-relaxed text-lg">
              However, no internet transmission is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* Privacy Rights - Light Background */}
        <section className="w-full bg-startsnap-wisp-pink border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-2xl font-bold text-startsnap-ebony-clay font-heading mb-6">
              6. Your Privacy Rights
            </h2>
            <p className="text-startsnap-river-bed leading-relaxed mb-6 text-lg">You have the following rights regarding your personal data:</p>
            <ul className="text-startsnap-river-bed leading-relaxed space-y-3 list-disc pl-6 mb-6">
              <li><strong>Access:</strong> View and download your personal data</li>
              <li><strong>Update:</strong> Correct or update your information through your profile</li>
              <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Withdraw Consent:</strong> Opt out of certain data processing activities</li>
            </ul>
            <p className="text-startsnap-river-bed leading-relaxed text-lg">
              To exercise these rights, please contact us through our platform or social media channels. We will respond
              to your request within 30 days.
            </p>
          </div>
        </section>

        {/* Additional Sections - Alternating Backgrounds */}
        <section className="w-full bg-white border-b-2 border-gray-800">
          <div className="max-w-4xl mx-auto px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-heading mb-4">
                  7. Cookies and Tracking
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed mb-4">
                  We use minimal cookies and local storage to:
                </p>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6 mb-4">
                  <li>Maintain your login session</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze platform usage and performance</li>
                </ul>
                <p className="text-startsnap-river-bed leading-relaxed">
                  You can control cookies through your browser settings, but disabling them may affect platform functionality.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-heading mb-4">
                  8. Third-Party Services
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed mb-4">
                  Our platform integrates with third-party services including:
                </p>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6 mb-4">
                  <li><strong>Supabase:</strong> Database and authentication services</li>
                  <li><strong>External Links:</strong> When you share project links, you're subject to those platforms' policies</li>
                  <li><strong>Social Media:</strong> Links to external social media profiles are governed by those platforms</li>
                </ul>
                <p className="text-startsnap-river-bed leading-relaxed">
                  We are not responsible for the privacy practices of external websites and services.
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
                  9. Data Retention
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed mb-4">
                  We retain your personal data for as long as your account is active. When you delete your account:
                </p>
                <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc pl-6">
                  <li>Your profile information is permanently deleted</li>
                  <li>Your projects and content may remain visible but disassociated from your identity</li>
                  <li>Some data may be retained for legal compliance or fraud prevention</li>
                  <li>Anonymized usage data may be retained for analytics</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-heading mb-4">
                  10. Children's Privacy
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed">
                  Our platform is not intended for children under 13 years of age. We do not knowingly collect personal
                  information from children under 13. If you believe we have collected information from a child under 13,
                  please contact us immediately.
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
                  11. International Data Transfers
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed">
                  Your data may be processed and stored in countries other than your own. We ensure appropriate safeguards
                  are in place to protect your data according to this privacy policy and applicable data protection laws.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-startsnap-ebony-clay font-heading mb-4">
                  12. Changes to This Policy
                </h2>
                <p className="text-startsnap-river-bed leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of significant changes by posting
                  the new policy on our platform and updating the "Last Updated" date. Your continued use of our service
                  after changes constitutes acceptance of the updated policy.
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
                13. Contact Us
              </h2>
              <p className="text-startsnap-river-bed leading-relaxed mb-6 text-lg">
                If you have any questions about this privacy policy or how we handle your data, please contact us:
              </p>
              <ul className="text-startsnap-river-bed leading-relaxed space-y-2 list-disc list-inside mb-8">
                <li>Through our platform's contact features</li>
                <li>Via our social media channels (@startsnapfun)</li>
                <li>By email (if provided on our platform)</li>
              </ul>

              <div className="bg-startsnap-white p-6 rounded-lg border-2 border-gray-800 shadow-[3px_3px_0px_#1f2937] max-w-2xl mx-auto">
                <p className="text-sm text-startsnap-river-bed">
                  By using startsnap.fun, you acknowledge that you have read and understood this Privacy Policy
                  and consent to our data practices as described herein.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};