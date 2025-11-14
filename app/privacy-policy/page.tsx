import { Header } from "@/components/layout/header";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background force-dark-theme">
      <main className="w-full mx-auto relative h-full overflow-x-hidden">
        <Header />
        <div className="md:w-full">
          <section className="flex flex-col min-h-screen w-full pt-16">
            <div className="lg:w-5xl 2xl:w-7xl border-x border-border mx-auto lg:py-20 py-10 lg:px-12 px-4">
              <h1 className="text-4xl lg:text-6xl 2xl:text-7xl font-[600] text-left tracking-tighter text-foreground mb-8">
                Privacy Policy
              </h1>

              <div className="prose prose-invert max-w-none">
                <p className="text-sm lg:text-lg text-muted-foreground mb-6">
                  Last updated: {new Date().toLocaleDateString("en-US")}
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Introduction
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Welcome to Tablium (the "Service", "we", "us", or "our"). We
                  are committed to protecting your privacy and ensuring that
                  your personal information is handled in a safe and responsible
                  manner. This Privacy Policy describes how we collect, use,
                  disclose, and store personal information when you use Tablium
                  (via web, mobile, APIs, or other platforms) or interact with
                  us (e.g., via support, email, surveys).
                </p>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  By using or accessing Tablium, you consent to the practices
                  described in this Privacy Policy. If you do not agree with
                  this Policy, please do not use our services.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Scope & Applicability
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  This Policy applies to all users, visitors, customers, trial
                  users, collaborators, and any other persons who interact with
                  Tablium or its features. It covers data collected directly
                  from you or automatically, as well as data obtained from third
                  parties (e.g. integrations).
                </p>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  If any portion of the Service is subject to a different
                  binding privacy policy (e.g. due to regulation in a particular
                  country), then that policy may supplement this one for that
                  portion.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Information We Collect
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  We collect different kinds of information depending on how you
                  use Tablium. Broadly, these are:
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  3.1 Information You Provide
                </h3>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    <strong>Registration / Account Information:</strong> name,
                    email address, password (hashed), user name or alias,
                    organization or team name (if applicable).
                  </li>
                  <li>
                    <strong>Profile / Settings:</strong> optional profile photo,
                    preferences, timezone, language, bio, contact info.
                  </li>
                  <li>
                    <strong>Content & Workspace Data:</strong> the grids,
                    blocks, files, images, text, media, links, integrations,
                    attachments, notes, comments, versions, templates, metadata,
                    formulas, structure/layout information, etc., that you or
                    your collaborators upload or create.
                  </li>
                  <li>
                    <strong>Communications & Feedback:</strong> support
                    requests, surveys, feature requests, feedback, email
                    correspondence, logs of communications.
                  </li>
                  <li>
                    <strong>Payment & Billing:</strong> billing address, name on
                    card, payment method (e.g. credit card token, or third-party
                    payment processor information), invoice data.
                  </li>
                  <li>
                    <strong>Usage & Technical Input:</strong> logs, error
                    reports, crash data, diagnostics, usage metrics, session
                    information, device identifiers, browser user agent, IP
                    address, geolocation (approximate), operating system,
                    browser type, domain names, referring URLs, timestamps.
                  </li>
                  <li>
                    <strong>Third-party Integration Data:</strong> if you
                    connect Tablium with external services (e.g. Google Drive,
                    GitHub, Figma, calendar services), we may collect and store
                    data from those services (e.g. file lists, metadata, shared
                    content) with your consent.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  3.2 Information Collected Automatically
                </h3>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    <strong>Usage Analytics:</strong> metrics on how features
                    are used (which blocks are used most, time spent, frequency,
                    clicks, etc.).
                  </li>
                  <li>
                    <strong>Cookies, Tracking & Similar Technologies:</strong>{" "}
                    we (and our authorized third-party partners) use cookies,
                    Web beacons, pixel tags, local storage, and similar to
                    recognize your device, remember settings, track usage,
                    measure performance, and serve analytics/advertising.
                  </li>
                  <li>
                    <strong>Server Logs & Activity:</strong> every request made
                    to our servers is logged (IP, headers, timestamp).
                  </li>
                  <li>
                    <strong>Crash & Diagnostic Data:</strong> when crashes or
                    errors occur, we may collect stack traces, memory logs, and
                    related technical data.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Purposes of Processing & Legal Bases
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  We use your data for the following purposes (and under
                  applicable legal bases such as consent, contract performance,
                  legitimate interests, legal compliance):
                </p>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-border rounded-lg">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-semibold text-foreground">
                          Purpose
                        </th>
                        <th className="text-left p-3 text-sm font-semibold text-foreground">
                          Description
                        </th>
                        <th className="text-left p-3 text-sm font-semibold text-foreground">
                          Legal Basis / Justification
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="p-3">
                          Account setup, user identity, authentication
                        </td>
                        <td className="p-3">
                          Create and manage your account, verify identity,
                          manage access
                        </td>
                        <td className="p-3">
                          Performance of contract, security
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3">Delivering the Service</td>
                        <td className="p-3">
                          Enabling you to build grids, add blocks, save content,
                          share, collaborate
                        </td>
                        <td className="p-3">Performance of contract</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3">Feature improvement & analytics</td>
                        <td className="p-3">
                          Understanding usage patterns, improving features,
                          metrics
                        </td>
                        <td className="p-3">
                          Legitimate interest (to improve product)
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3">Communications & support</td>
                        <td className="p-3">
                          Responding to customer inquiries, sending
                          announcements, updates
                        </td>
                        <td className="p-3">
                          Performance of contract / Consent / Legitimate
                          interest
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3">Billing & payments</td>
                        <td className="p-3">
                          Processing subscriptions, invoices, refunds
                        </td>
                        <td className="p-3">Performance of contract</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3">Integrations</td>
                        <td className="p-3">
                          Enabling third-party integrations (Google, GitHub,
                          etc.) per your connections
                        </td>
                        <td className="p-3">
                          Consent / Performance of contract
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3">Security & fraud prevention</td>
                        <td className="p-3">
                          Detecting abuse, unauthorized access, spam, malicious
                          activity
                        </td>
                        <td className="p-3">
                          Legitimate interest / Compliance
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3">Legal & regulatory compliance</td>
                        <td className="p-3">
                          Complying with law, auditing, enforcing terms
                        </td>
                        <td className="p-3">Legal obligation</td>
                      </tr>
                      <tr>
                        <td className="p-3">Marketing & promotions</td>
                        <td className="p-3">
                          Sending newsletters, promotional offers (where
                          allowed)
                        </td>
                        <td className="p-3">
                          Consent (opt-in) or legitimate interest (depending on
                          local law)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Sharing & Disclosure
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  We do not sell your personal data. We may share or disclose
                  your information in the following cases:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    <strong>With collaborators & permitted users:</strong> If
                    you invite team members or collaborators, they will have
                    access (as permitted) to your shared workspaces, grids, or
                    content.
                  </li>
                  <li>
                    <strong>Service providers & third-party vendors:</strong> We
                    may share data with companies that assist us (e.g. hosting
                    providers, analytics services, email delivery services,
                    payment processors). We require them to maintain
                    confidentiality and only use data to provide their service.
                  </li>
                  <li>
                    <strong>Third-party integrations:</strong> When you connect
                    external services (e.g. Google Drive, GitHub), the data from
                    those services may be accessible by us or stored, per your
                    permission.
                  </li>
                  <li>
                    <strong>Legal & compliance:</strong> If required by law,
                    court order, regulation, or government request; to detect,
                    prevent or address fraud, security breaches, or violations
                    of our Terms; or to protect rights, property, safety of
                    Tablium, users, or the public.
                  </li>
                  <li>
                    <strong>Business transfers:</strong> If we merge, acquire,
                    sell, or reorganize all or part of our business, user data
                    may be transferred (under appropriate confidentiality and
                    protective measures).
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Storage, Security & Data Retention
                </h2>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  6.1 Storage Location & Security
                </h3>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    We store data on secure servers / cloud infrastructure under
                    industry standards (encryption at rest and in transit,
                    access controls, firewalls).
                  </li>
                  <li>
                    Sensitive data (e.g. passwords) is hashed or encrypted using
                    modern methods.
                  </li>
                  <li>
                    Access to personal data is limited to employees,
                    contractors, and service providers on a need-to-know basis.
                  </li>
                  <li>
                    We maintain policies and procedures to monitor, audit, and
                    test the security infrastructure, and respond to security
                    incidents.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  6.2 Data Retention
                </h3>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    We keep personal data as long as necessary to fulfill the
                    purposes in this Policy (e.g. to provide the service, comply
                    with legal obligations, resolve disputes).
                  </li>
                  <li>
                    If you delete your account, we may retain certain data in
                    anonymized or aggregated form.
                  </li>
                  <li>
                    Inactive accounts: we may periodically delete or anonymize
                    data from accounts that have been inactive for a long time
                    (with prior notice).
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Your Rights & Choices
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Depending on your jurisdiction, you may have the following
                  rights regarding your personal data:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    <strong>Access:</strong> Request a copy of the personal data
                    we hold about you.
                  </li>
                  <li>
                    <strong>Rectification / Correction:</strong> Request
                    corrections or updates to inaccurate or incomplete data.
                  </li>
                  <li>
                    <strong>
                      Deletion / Erasure ("Right to be Forgotten"):
                    </strong>{" "}
                    Request deletion of your data (subject to legal or
                    contractual exceptions).
                  </li>
                  <li>
                    <strong>Restriction of Processing:</strong> Request that we
                    limit how we process your data.
                  </li>
                  <li>
                    <strong>Data Portability:</strong> Request to receive your
                    data in a structured, machine-readable format and/or
                    transmit it to another provider.
                  </li>
                  <li>
                    <strong>Object / Opt-Out:</strong> Object to certain
                    processing (such as marketing) or opt out of certain uses
                    (where applicable).
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Where processing is based
                    on consent, you may withdraw consent at any time (without
                    affecting processing done before withdrawal).
                  </li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  To exercise these rights, you can contact us at the contact
                  details below. We may require identity verification before
                  acting on requests.
                </p>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  <strong>Note:</strong> Some rights may not apply in all
                  jurisdictions or may be limited by legal exceptions.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Cookies & Tracking Technologies
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  We (and our partners) use cookies, web beacons, pixel tags,
                  local storage, and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    Recognize your device and remember preferences (language,
                    theme, settings)
                  </li>
                  <li>Enable session management (keeping you logged in)</li>
                  <li>Analyze usage (which features are used, performance)</li>
                  <li>
                    Serve analytics and measurement (e.g. Google Analytics,
                    segment tools)
                  </li>
                  <li>
                    Optionally, for marketing, retargeting, or advertising (to
                    the extent permitted by law and your consent)
                  </li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  You can usually block or delete cookies through your browser
                  settings, but if you do so, certain functionalities (login,
                  persistent preferences, auto-saving) may not work properly.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Minors & Children
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Our Service is not intended for children under a minimum age
                  (e.g. under 13). We do not knowingly collect personal data
                  from minors. If you believe we have collected such data,
                  please contact us so we may delete it.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  10. International Transfers
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Because Tablium is accessible globally, your data may be
                  transferred to, stored in, or processed in countries other
                  than your country of residence (including servers or service
                  providers outside your jurisdiction).
                </p>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Where transfers occur, we use appropriate safeguards (e.g.
                  Standard Contractual Clauses, privacy shields, or other
                  legally recognized mechanisms) to ensure sufficient protection
                  of your data in accordance with this Policy and applicable
                  law.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  11. Third-Party Links & Embedded Content
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  If Tablium includes links to third-party sites, apps, plugins,
                  or embedded content (e.g. YouTube, social media), they may
                  collect or use data independently under their own privacy
                  policies. We are not responsible for their practices. We
                  encourage you to review their policies before interacting.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  12. Changes to This Policy
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  We may update this Privacy Policy from time to time (e.g. due
                  to new features, legal changes). We will post the new
                  effective date at the top and, when required by law, provide
                  you with notice (e.g. via email or in-app). Continued use of
                  the Service after changes constitutes your acceptance.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  13. Contact
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  If you have questions about this Privacy Policy, you can
                  contact us through:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>Email: privacy@tablium.com</li>
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
