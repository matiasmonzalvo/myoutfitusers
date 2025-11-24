import Link from "next/link";
import { ChevronRight, Sparkles, AlertCircle } from "lucide-react";

export default function BestPracticesPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-[44px] font-bold tracking-tighter mb-2">
        Best Practices
      </h1>
      <p className="text-base text-foreground mb-8 leading-[1.4]">
        Follow these expert tips and recommendations to get the best results
        from your try-ons and maximize your credits.
      </p>

      <div className="space-y-10">
        {/* Golden Rules */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Golden Rules
          </h2>
          <div className="space-y-4">
            <div className="">
              <div className="flex items-start">
                <div>
                  <h3 className="font-semibold text-primary mb-2">
                    Use 1-2 Items Per Try-On
                  </h3>
                  <p className="text-base text-foreground">
                    The AI performs best with 1-2 products at a time. For the
                    most accurate fit and design representation, try on items
                    individually, especially for detailed or branded garments.
                  </p>
                </div>
              </div>
            </div>

            <div className="">
              <div className="flex items-start">
                <div>
                  <h3 className="font-semibold text-primary mb-2">
                    Start With Sneakers or Pants + Sneakers
                  </h3>
                  <p className="text-base text-foreground">
                    Always try on sneakers first, then add other garments on
                    top. Alternatively, start with pants + sneakers together
                    before adding upper body items.
                  </p>
                </div>
              </div>
            </div>

            <div className="">
              <div className="flex items-start">
                <div>
                  <h3 className="font-semibold text-primary mb-2">
                    Detailed Items Need Solo Try-Ons
                  </h3>
                  <p className="text-base text-foreground">
                    Highly detailed garments with intricate patterns, multiple
                    logos, or complex designs work best when tried on alone.
                    This ensures the AI captures all the details accurately.
                  </p>
                </div>
              </div>
            </div>

            <div className="">
              <div className="flex items-start">
                <div>
                  <h3 className="font-semibold text-primary mb-2">
                    If you're trying on a hoodie, don't add a t-shirt before.
                  </h3>
                  <p className="text-base text-foreground">
                    If the sweatshirt or hoodie completely covers the t-shirt
                    underneath (like zip hoodies or thick pullovers), it's
                    better to try it on without adding a t-shirt first. This
                    saves a step and won’t affect the final result, since the
                    hoodie will fully cover the layer beneath anyway.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Mixing Warning */}
        <section>
          <div className="bg-orange-500/5 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-500 mb-2">
                  Avoid Mixing Known and Unknown Brands
                </h3>
                <p className="text-sm text-orange-500 mb-3">
                  When trying on products from well-known brands (Nike, Adidas,
                  Supreme) together with lesser-known brands, the AI may
                  incorrectly apply the famous brand's logo to the unknown
                  brand's product.
                </p>
                <p className="text-sm text-orange-500 font-semibold">
                  Solution: Try on items from different brand recognition levels
                  separately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trial and Error */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Embrace Trial and Error
          </h2>
          <p className="text-base text-foreground mb-4">
            Try-ons are meant to be experimental. If something doesn't work,
            don't worry—just adjust your approach. If you tried on 2+ items and
            it didn't work, rollback to the previous state and try on the items
            one at a time. Start with the simpler item first.
          </p>
        </section>

        {/* Known Limitations */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Known AI Limitations
          </h2>
          <p className="text-base text-foreground mb-2">
            The AI is powerful but has some limitations you should be aware of:
          </p>
          <div className="space-y-3">
            <div className="">
              <h3 className="text-base font-semibold text-foreground">
                Slight Face Alterations
              </h3>
              <p className="text-base text-foreground">
                The AI may slightly alter your avatar's facial features with
                each try-on. This is a limitation of pixel-by-pixel regeneration
                and is unavoidable.
              </p>
            </div>
            <div className="">
              <h3 className="text-base font-semibold text-foreground mb-1">
                Background Changes
              </h3>
              <p className="text-base text-foreground">
                The background may darken or change slightly with each try-on.
                This is normal AI behavior during image regeneration.
              </p>
            </div>
            <div className="">
              <h3 className="text-base font-semibold text-foreground mb-1">
                Complex Item Combinations
              </h3>
              <p className="text-base text-foreground">
                Trying on 3+ detailed items at once may produce unexpected
                results. The AI works best with simpler combinations.
              </p>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="grid md:grid-cols-2 gap-4">
          <Link
            href="/guide/optimal-strategy"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Optimal Strategy</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Deep dive into advanced strategies for maximum efficiency.
            </p>
            <div className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              Learn More
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
          <Link
            href="/guide/common-issues"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Common Issues</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Troubleshoot problems and find solutions to frequent issues.
            </p>
            <div className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              View Solutions
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
