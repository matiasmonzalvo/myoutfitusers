import Link from "next/link";
import { ChevronRight, CreditCard, ShoppingCart, Shield } from "lucide-react";

export default function PurchasingTryOnsPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-5xl font-bold tracking-tighter mb-2">
        Purchasing Try-Ons
      </h1>
      <p className="text-lg 2xl:text-xl text-muted-foreground mb-8 leading-[1.2]">
        Learn how to purchase try-on credits, understand our payment process, and
        get the best value for your money.
      </p>

      <div className="space-y-10">
        {/* How to Purchase */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight">
              How to Purchase Credits
            </h2>
          </div>
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="border border-border rounded-xl p-6 bg-white dark:bg-black/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    Visit the Pricing Page
                  </h3>
                  <p className="text-base text-muted-foreground mb-3">
                    Navigate to the pricing page to view all available try-on credit
                    packages and their prices.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                  >
                    Go to Pricing Page
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-border rounded-xl p-6 bg-white dark:bg-black/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    Choose Your Package
                  </h3>
                  <p className="text-base text-muted-foreground mb-3">
                    Select the package that best fits your needs. Larger packages
                    offer better value per credit.
                  </p>
                  <div className="bg-blue-500/5 rounded-lg p-3">
                    <p className="text-sm text-blue-500">
                      <strong>Tip:</strong> Consider how often you'll use the
                      platform. Frequent users save more with larger packages.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-border rounded-xl p-6 bg-white dark:bg-black/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    Complete Checkout
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Click "Purchase" and complete the secure checkout process. We
                    use Polar.sh for secure payment processing, which accepts all
                    major credit cards and payment methods.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border border-border rounded-xl p-6 bg-white dark:bg-black/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    Credits Added Instantly
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Once payment is confirmed, credits are added to your account
                    immediately. You can start using them right away!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Security */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight">
              Payment Security
            </h2>
          </div>
          <p className="text-base text-muted-foreground mb-6">
            Your payment information is safe and secure with My Outfit.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-green-500 mb-2">
                Secure Processing
              </h3>
              <p className="text-sm text-green-500">
                We use Polar.sh, a trusted payment processor with bank-level
                encryption to protect your financial information.
              </p>
            </div>
            <div className="bg-green-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-green-500 mb-2">
                No Stored Card Data
              </h3>
              <p className="text-sm text-green-500">
                My Outfit never stores your credit card information on our servers.
                All payment data is handled by our secure payment partner.
              </p>
            </div>
            <div className="bg-green-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-green-500 mb-2">
                PCI Compliant
              </h3>
              <p className="text-sm text-green-500">
                Our payment processing meets all PCI DSS (Payment Card Industry
                Data Security Standard) requirements.
              </p>
            </div>
            <div className="bg-green-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-green-500 mb-2">
                Instant Confirmation
              </h3>
              <p className="text-sm text-green-500">
                You'll receive an email confirmation immediately after your purchase
                is complete.
              </p>
            </div>
          </div>
        </section>

        {/* Accepted Payment Methods */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-primary" />
            <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight">
              Accepted Payment Methods
            </h2>
          </div>
          <div className="bg-blue-500/5 rounded-xl p-6">
            <p className="text-sm text-blue-500 mb-4">
              We accept a wide variety of payment methods through Polar.sh:
            </p>
            <ul className="space-y-2 text-sm text-blue-500">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Visa, Mastercard, American Express, Discover
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Debit cards from major banks
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Digital wallets (Apple Pay, Google Pay)
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                International payment methods
              </li>
            </ul>
          </div>
        </section>

        {/* Package Comparison */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Choosing the Right Package
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            Not sure which package to choose? Here are some recommendations:
          </p>
          <div className="space-y-3">
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Casual User (5-10 Credits)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Perfect for trying out the platform or occasional use. Great for
                testing a few specific items from non-partner brands.
              </p>
              <p className="text-xs text-muted-foreground">
                Best for: New users, occasional shoppers, trying specific items
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Regular User (25-50 Credits)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Ideal for frequent styling sessions. Build multiple outfits and
                experiment with various combinations.
              </p>
              <p className="text-xs text-muted-foreground">
                Best for: Regular users, outfit planning, style enthusiasts
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Power User (100+ Credits)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Maximum value for heavy users. Create unlimited outfits and explore
                every product on the platform.
              </p>
              <p className="text-xs text-muted-foreground">
                Best for: Fashion enthusiasts, content creators, daily users
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Purchase FAQs
          </h2>
          <div className="space-y-3">
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">
                What if I run out of credits?
              </h3>
              <p className="text-sm text-muted-foreground">
                You can purchase more credits anytime from the pricing page. Your
                previous credits never expire, so you can top up whenever needed.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">
                Can I get a refund?
              </h3>
              <p className="text-sm text-muted-foreground">
                Credits are non-refundable once purchased. However, if you
                experience a technical issue that causes a failed try-on, that
                credit will be automatically refunded to your account.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">
                Do credits expire?
              </h3>
              <p className="text-sm text-muted-foreground">
                No! Your try-on credits never expire. Use them at your own pace
                without any time pressure.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">
                Can I gift credits to someone?
              </h3>
              <p className="text-sm text-muted-foreground">
                Currently, we don't offer gift credits. Each account must purchase
                their own credits. We're exploring this feature for the future!
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">
                What currency are prices in?
              </h3>
              <p className="text-sm text-muted-foreground">
                All prices are displayed in USD. Your card will be charged in USD,
                and your bank may apply currency conversion if you're using a
                non-USD card.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Purchase?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get try-on credits now and unlock the full My Outfit experience. Try on
            products from every brand and create unlimited outfit combinations.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
          >
            View Packages
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
