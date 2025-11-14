import { Header } from "@/components/layout/header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="bg-background force-dark-theme">
      <main className="w-full mx-auto relative h-full overflow-x-hidden">
        <Header />
        <div className="md:w-full">
          <section className="flex flex-col min-h-screen w-full pt-16">
            <div className="lg:w-5xl 2xl:w-7xl border-x border-border mx-auto lg:py-20 py-10 lg:px-12 px-4">
              <h1 className="text-4xl lg:text-6xl 2xl:text-7xl font-[600] text-left tracking-tighter text-foreground mb-8">
                Terms of Service
              </h1>

              <div className="prose prose-invert max-w-none">
                <p className="text-sm lg:text-lg text-muted-foreground mb-6">
                  Last updated: {new Date().toLocaleDateString("en-US")}
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Welcome to Tablium ("Service", "we", "our", "us"). By
                  accessing or using Tablium (via web, mobile, or any other
                  platform), you agree to be bound by these Terms of Service
                  ("Terms"). If you do not agree, do not use the Service.
                </p>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  These Terms govern your use of Tablium, including any content,
                  functionality, and services offered. They apply to all users,
                  visitors, and account holders.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Eligibility
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  You may use Tablium only if:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    You are at least 13 years old (or the minimum age of digital
                    consent in your jurisdiction).
                  </li>
                  <li>
                    You have the legal capacity to enter into these Terms.
                  </li>
                  <li>
                    You comply with all applicable laws, rules, and regulations.
                  </li>
                  <li>
                    If you are using Tablium on behalf of an organization, you
                    represent that you are authorized to bind that organization
                    to these Terms.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Accounts & Registration
                </h2>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    <strong>Account creation:</strong> You must provide accurate
                    and complete information when creating an account.
                  </li>
                  <li>
                    <strong>Security:</strong> You are responsible for
                    safeguarding your account credentials and for all activities
                    under your account. Notify us immediately if you suspect
                    unauthorized access.
                  </li>
                  <li>
                    <strong>Restrictions:</strong> You may not share your
                    account credentials, impersonate another person, or
                    misrepresent your identity.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Use of the Service
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  You may use Tablium to create grids, add blocks, collaborate,
                  and access integrations. By using the Service, you agree not
                  to:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-4 space-y-2">
                  <li>
                    Use the Service for unlawful, harmful, fraudulent, or
                    abusive purposes.
                  </li>
                  <li>
                    Upload or share malicious software, viruses, or harmful
                    code.
                  </li>
                  <li>
                    Infringe the intellectual property or privacy rights of
                    others.
                  </li>
                  <li>
                    Interfere with or disrupt the Service or its infrastructure.
                  </li>
                  <li>
                    Attempt to gain unauthorized access to any accounts,
                    systems, or networks.
                  </li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  We reserve the right to suspend or terminate accounts that
                  violate these Terms.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. User Content
                </h2>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    <strong>Ownership:</strong> You retain all rights to the
                    content you create, upload, or share ("User Content").
                  </li>
                  <li>
                    <strong>License to Tablium:</strong> By using the Service,
                    you grant us a limited, worldwide, non-exclusive,
                    royalty-free license to host, store, display, and process
                    your User Content solely for the purpose of operating and
                    improving the Service.
                  </li>
                  <li>
                    <strong>Responsibility:</strong> You are solely responsible
                    for your User Content and must ensure it does not violate
                    any laws, infringe rights, or contain harmful material.
                  </li>
                  <li>
                    <strong>Collaboration:</strong> Content shared with
                    collaborators may be visible and editable depending on your
                    settings.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Intellectual Property
                </h2>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    <strong>Our Rights:</strong> Tablium and its associated
                    content, branding, design, software, and features are owned
                    by us or our licensors and are protected by intellectual
                    property laws.
                  </li>
                  <li>
                    <strong>Restrictions:</strong> You may not copy, modify,
                    distribute, reverse engineer, or create derivative works of
                    the Service without our prior written consent.
                  </li>
                  <li>
                    <strong>Feedback:</strong> If you provide suggestions,
                    feedback, or ideas, you grant us the right to use them
                    without obligation or compensation.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Subscriptions, Payments & Billing
                </h2>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    Some features may require a paid subscription. By
                    subscribing, you agree to pay the applicable fees.
                  </li>
                  <li>Payments are processed through third-party providers.</li>
                  <li>
                    Subscription fees are non-refundable except as required by
                    law.
                  </li>
                  <li>
                    We may change pricing with reasonable notice. Continued use
                    after changes constitutes acceptance.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Third-Party Services & Integrations
                </h2>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    Tablium may integrate with third-party services (e.g. Google
                    Drive, GitHub, Figma).
                  </li>
                  <li>
                    Your use of such integrations is subject to their respective
                    terms and policies.
                  </li>
                  <li>
                    We are not responsible for third-party services or their
                    handling of your data.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Termination
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  We may suspend or terminate your account or access to the
                  Service at any time, with or without cause, including if you
                  violate these Terms.
                </p>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Upon termination, your right to use the Service ceases
                  immediately, but sections relating to intellectual property,
                  disclaimers, limitations of liability, and indemnification
                  will survive.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  10. Disclaimers
                </h2>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>The Service is provided "AS IS" and "AS AVAILABLE".</li>
                  <li>
                    We make no warranties, express or implied, regarding the
                    availability, reliability, accuracy, or suitability of the
                    Service.
                  </li>
                  <li>
                    We do not guarantee that the Service will be uninterrupted,
                    secure, or error-free.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  11. Limitation of Liability
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  To the maximum extent permitted by law:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    We are not liable for any indirect, incidental, special,
                    consequential, or punitive damages, including lost profits,
                    data, or goodwill.
                  </li>
                  <li>
                    Our total liability for any claim related to the Service
                    will not exceed the amount you paid to us in the 12 months
                    preceding the claim.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  12. Indemnification
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  You agree to indemnify and hold harmless Tablium, its
                  affiliates, officers, employees, and partners from any claims,
                  damages, liabilities, costs, or expenses arising from your use
                  of the Service, violation of these Terms, or infringement of
                  third-party rights.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  13. Governing Law & Dispute Resolution
                </h2>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>These Terms shall be governed by the laws of Spain.</li>
                  <li>
                    Any disputes will be resolved in the courts of Spain, unless
                    otherwise required by law.
                  </li>
                  <li>
                    Where applicable, you agree to resolve disputes through
                    binding arbitration if required by local law or our separate
                    arbitration policy.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  14. Changes to the Terms
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  We may modify these Terms from time to time. Updates will be
                  posted with the "Last updated" date. Continued use of the
                  Service after changes constitutes acceptance of the new Terms.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  15. Contact
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  If you have questions about these Terms of Service, you can
                  contact us through:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>Email: legal@tablium.com</li>
                  <li>
                    Feedback page:{" "}
                    <a
                      href="/feedback"
                      className="text-[#8e51ff] hover:underline"
                    >
                      /feedback
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <Footer />
        </div>
      </main>
    </div>
  );
}
