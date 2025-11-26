import { Header } from "@/components/layout/header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="bg-background">
      <main className="w-full mx-auto relative h-full overflow-x-hidden">
        <div className="md:w-full">
          <section className="flex flex-col min-h-screen w-full pt-4">
            <div className="lg:px-0 px-4">
              <h1 className="text-4xl lg:text-5xl font-[600] text-left tracking-tighter text-foreground mb-8">
                Terms of Use
              </h1>

              <div className="prose prose-invert max-w-none">
                <p className="text-sm lg:text-lg text-muted-foreground mb-6">
                  Last Updated: November 25, 2025
                </p>

                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Welcome to My Outfit ("My Outfit," "we," "us," or "our").
                  These Terms of Use ("Terms") govern your access to and use of
                  our website, mobile application, artificial intelligence
                  features, and related services (collectively, the "Services").
                </p>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  By accessing or using My Outfit, you agree to be bound by
                  these Terms and our{" "}
                  <a
                    href="/privacy-policy"
                    className="text-[#0095f6] hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  If you do not agree to these Terms, you must immediately stop
                  using the Services.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Overview
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  My Outfit is a digital platform that allows users to:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>Create and visualize AI-generated outfits.</li>
                  <li>Try on clothing virtually using AI models.</li>
                  <li>
                    Save and share personalized outfits publicly or privately.
                  </li>
                  <li>
                    Explore community content, discover trends, and interact
                    with other users' creations.
                  </li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  My Outfit provides digital try-on and outfit management tools;
                  it does not sell physical goods or represent any brand unless
                  explicitly stated.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Eligibility
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  To use My Outfit:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    You must be at least 13 years old, or the legal age in your
                    country to consent to data processing and contracts online.
                  </li>
                  <li>
                    If you are under 18, you may use the Services only under the
                    supervision of a parent or guardian who agrees to these
                    Terms.
                  </li>
                  <li>
                    You represent and warrant that all registration information
                    you submit is accurate, complete, and truthful.
                  </li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  We may suspend or terminate accounts that violate eligibility
                  requirements or provide false information.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Account Registration and Security
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  When creating an account, you agree to:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>Provide accurate and up-to-date information.</li>
                  <li>Keep your password secure and confidential.</li>
                  <li>
                    Notify us immediately of unauthorized access or use of your
                    account.
                  </li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  You are responsible for all activity under your account,
                  including the actions of any third party who uses it.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Description of Services
                </h2>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  4.1. Core Features
                </h3>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  My Outfit provides AI-based functionality including:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    <strong>Virtual Try-On:</strong> Upload your image or avatar
                    to preview how clothing or accessories appear on you.
                  </li>
                  <li>
                    <strong>Outfit Creation:</strong> Combine products to create
                    complete looks.
                  </li>
                  <li>
                    <strong>Outfit Sharing:</strong> Save, publish, and share
                    outfits publicly or privately.
                  </li>
                  <li>
                    <strong>Profile Display:</strong> Show your current or
                    favorite outfits to other users.
                  </li>
                  <li>
                    <strong>Community Discovery:</strong> Explore featured,
                    trending, or recommended outfits.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  4.2. AI Functionality
                </h3>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    AI-generated images and recommendations are provided "as
                    is."
                  </li>
                  <li>
                    Results depend on the data you provide, and we do not
                    guarantee exact visual accuracy or representation of fit,
                    color, or material.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Acceptable Use Policy
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  You agree to use My Outfit in accordance with all applicable
                  laws and the following guidelines:
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  5.1. Prohibited Activities
                </h3>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  You may not:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    Upload, post, or share content that is illegal, hateful,
                    defamatory, or obscene.
                  </li>
                  <li>
                    Upload or generate nudity, sexually explicit, or violent
                    content.
                  </li>
                  <li>
                    Misuse AI features to impersonate others or produce
                    misleading visuals.
                  </li>
                  <li>
                    Use My Outfit to infringe on copyrights, trademarks, or
                    intellectual property rights.
                  </li>
                  <li>
                    Attempt to reverse-engineer, decompile, or modify any
                    component of the Service.
                  </li>
                  <li>
                    Use bots, scripts, or scraping tools to access data or
                    manipulate platform functionality.
                  </li>
                  <li>
                    Use the platform for commercial reselling or unauthorized
                    advertising.
                  </li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Violation of these rules may result in suspension or permanent
                  termination of your account.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. User Content
                </h2>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  6.1. Ownership
                </h3>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  You retain full ownership of the outfits, photos, and other
                  content you create ("User Content").
                </p>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  However, by uploading or publishing content, you grant My
                  Outfit a non-exclusive, worldwide, royalty-free, sublicensable
                  license to:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    Store, display, reproduce, and distribute your content
                    within the platform.
                  </li>
                  <li>
                    Use anonymized versions of your content to improve AI
                    algorithms and personalization features.
                  </li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  This license exists solely for the purpose of operating and
                  improving the Services.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  6.2. Public Visibility
                </h3>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  When you choose to publish outfits publicly, the following
                  information may be visible:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>Your username and profile avatar.</li>
                  <li>
                    The outfit image and details (products, styles, etc.).
                  </li>
                  <li>Engagement data (likes, comments, reposts).</li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  You can manage visibility at any time via your account
                  settings.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  6.3. Responsibility for Content
                </h3>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  You are solely responsible for the content you create, upload,
                  or share.
                </p>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  We reserve the right to remove or moderate any content that:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>Violates these Terms.</li>
                  <li>Harms or threatens the safety or privacy of others.</li>
                  <li>Appears to misuse third-party brands or trademarks.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Intellectual Property Rights
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  All intellectual property rights related to My Outfit —
                  including software, designs, graphics, trademarks, and logos —
                  are owned by or licensed to My Outfit.
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    You are granted a limited, non-transferable, revocable
                    license to use the Services solely for personal and
                    non-commercial purposes.
                  </li>
                  <li>
                    You may not copy, modify, distribute, or create derivative
                    works of our software or content without written consent.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Payments and Subscriptions
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Certain features of My Outfit (e.g., AI try-ons, premium
                  plans) require payment.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  8.1. Payment Processing
                </h3>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    Payments are securely handled through third-party providers
                    such as Polar or Stripe.
                  </li>
                  <li>We do not store full credit card information.</li>
                  <li>
                    By purchasing a plan, you authorize My Outfit and its
                    payment processor to charge your chosen payment method.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  8.2. Subscription Terms
                </h3>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    Subscription plans renew automatically unless canceled
                    before the renewal date.
                  </li>
                  <li>
                    You may cancel anytime through your account dashboard;
                    cancellation takes effect at the end of the billing period.
                  </li>
                  <li>Fees are non-refundable except where required by law.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  8.3. Metered or Usage-Based Billing
                </h3>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    For AI features billed per use (e.g., per try-on), you will
                    be charged according to the published rate and frequency
                    (daily, weekly, or monthly).
                  </li>
                  <li>
                    Abusive or fraudulent usage may result in account
                    suspension.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Third-Party Integrations
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  My Outfit integrates with external APIs and partners to
                  enhance functionality (e.g., product catalogs, AI image
                  processing, payments).
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    We are not responsible for the content, availability, or
                    privacy practices of third-party services.
                  </li>
                  <li>
                    Use of third-party services is governed by their respective
                    terms and policies.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  10. AI-Generated Content Disclaimer
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  AI-generated outputs may not always reflect reality or product
                  accuracy. By using the AI features, you acknowledge that:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>The visual representation of items is simulated.</li>
                  <li>
                    Outfits generated do not imply ownership, endorsement, or
                    affiliation with the represented brands.
                  </li>
                  <li>
                    My Outfit is not responsible for errors or
                    misinterpretations resulting from AI generation.
                  </li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  All outputs should be viewed as creative approximations for
                  visualization and entertainment purposes.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  11. Privacy and Data Protection
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  Your use of the Services is also governed by our{" "}
                  <a
                    href="/privacy-policy"
                    className="text-[#0095f6] hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    We apply modern encryption, secure storage, and
                    GDPR-compliant practices to protect your information.
                  </li>
                  <li>
                    By using the platform, you consent to the collection and use
                    of data as described in that policy.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  12. Termination of Service
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  We may suspend or terminate your account without notice if:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>You violate these Terms.</li>
                  <li>You engage in fraud, abuse, or illegal activity.</li>
                  <li>We discontinue the Services or part thereof.</li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  Upon termination:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>Your license to use the platform ends immediately.</li>
                  <li>
                    We may retain minimal information necessary for compliance
                    purposes.
                  </li>
                </ul>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  You may also terminate your account voluntarily by contacting{" "}
                  <a
                    href="mailto:contact@myout.fit"
                    className="text-[#0095f6] hover:underline"
                  >
                    contact@myout.fit
                  </a>
                  .
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  13. Limitation of Liability
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  To the maximum extent permitted by law:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    My Outfit, its affiliates, and partners shall not be liable
                    for indirect, incidental, special, or consequential damages,
                    including data loss, account deletion, or unauthorized
                    access.
                  </li>
                  <li>
                    Our total liability shall not exceed the total fees paid by
                    you (if any) in the last 12 months preceding the event
                    giving rise to the claim.
                  </li>
                  <li>
                    The Services are provided "as is" and "as available" without
                    warranties of any kind, express or implied.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  14. Indemnification
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  You agree to indemnify and hold harmless My Outfit, its
                  officers, employees, and partners from any claims, damages,
                  liabilities, or expenses arising from:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>Your use of the Services.</li>
                  <li>Your content or interactions.</li>
                  <li>Your violation of these Terms or applicable laws.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  15. Changes to the Terms
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-4">
                  We may update these Terms periodically.
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    Changes will take effect upon posting or upon notification
                    via email or in-app alert.
                  </li>
                  <li>
                    Your continued use after the effective date constitutes
                    acceptance of the revised Terms.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  16. Governing Law and Jurisdiction
                </h2>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    These Terms are governed by and construed in accordance with
                    the laws of Argentina, without regard to conflict of law
                    principles.
                  </li>
                  <li>
                    Any dispute arising out of or relating to these Terms shall
                    be subject to the exclusive jurisdiction of the courts of
                    Buenos Aires, Argentina.
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  17. Severability
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  If any provision of these Terms is found unenforceable or
                  invalid, the remaining provisions shall continue in full force
                  and effect.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  18. Entire Agreement
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  These Terms constitute the entire agreement between you and My
                  Outfit regarding your use of the Services and supersede all
                  prior communications or understandings.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  19. Contact
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  If you have questions about these Terms of Use, you can
                  contact us through:
                </p>
                <ul className="list-disc list-inside text-sm lg:text-base text-muted-foreground mb-6 space-y-2">
                  <li>
                    Email:{" "}
                    <a
                      href="mailto:contact@myout.fit"
                      className="text-[#0095f6] hover:underline"
                    >
                      contact@myout.fit
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
