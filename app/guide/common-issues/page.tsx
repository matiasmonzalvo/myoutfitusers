import Link from "next/link";
import { ChevronRight, AlertTriangle, Check } from "lucide-react";

export default function CommonIssuesPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-5xl font-bold tracking-tighter mb-2">
        Common Issues & Solutions
      </h1>
      <p className="text-lg 2xl:text-xl text-muted-foreground mb-8 leading-[1.2]">
        Troubleshoot frequent problems and learn how to resolve them for better
        try-on results.
      </p>

      <div className="space-y-10">
        {/* Most Common Issues */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-6">
            Most Common Issues
          </h2>

          {/* Issue 1 */}
          <div className="space-y-6">
            <div className="border border-neutral-500/10 rounded-xl overflow-hidden">
              <div className="bg-neutral-500/10 p-4 border-b border-neutral-500/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Products Not Looking Accurate
                    </h3>
                    <p className="text-sm text-foreground mt-1">
                      The product appears distorted, blurry, or doesn't match
                      the original design.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-500 mb-2">
                      Solutions:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Try the item alone:</strong> Detailed products
                          work best when tried on individually without other
                          items.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Reduce item count:</strong> If you tried on 3+
                          items, rollback and try fewer items together.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Check brand mixing:</strong> Separate famous
                          brands from lesser-known brands into different
                          try-ons.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue 2 */}
            <div className="border border-neutral-500/10 rounded-xl overflow-hidden">
              <div className="bg-neutral-500/10 p-4 border-b border-neutral-500/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Logos Appearing on Wrong Products
                    </h3>
                    <p className="text-sm text-foreground mt-1">
                      Famous brand logos (Nike, Adidas) showing up on products
                      from different brands.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-500 mb-2">
                      Solutions:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Try brands separately:</strong> Don't mix
                          well-known brands with lesser-known brands in the same
                          try-on.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Solo famous brands:</strong> Try high-profile
                          branded items alone to prevent logo contamination.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Layer strategically:</strong> If mixing is
                          necessary, put lesser-known brands on top of famous
                          brands, not the reverse.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue 3 */}
            <div className="border border-neutral-500/10 rounded-xl overflow-hidden">
              <div className="bg-neutral-500/10 p-4 border-b border-neutral-500/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Avatar Face Looks Different
                    </h3>
                    <p className="text-sm text-foreground mt-1">
                      The avatar's face changes slightly after each try-on.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-500 mb-2">
                      Explanation:
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      This is a known AI limitation. The model regenerates
                      images pixel-by-pixel, which can cause minor facial
                      variations. This is unavoidable with current AI
                      technology.
                    </p>
                    <h4 className="font-semibold text-green-500 mb-2">
                      Mitigation:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          Use the <strong>face enhancement</strong> feature if
                          available to restore facial consistency.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          Minimize the number of try-ons by planning outfits
                          carefully.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          Save versions of your avatar that look best for future
                          reference.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue 4 */}
            <div className="border border-neutral-500/10 rounded-xl overflow-hidden">
              <div className="bg-neutral-500/10 p-4 border-b border-neutral-500/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Can't Try On Another Item of Same Category
                    </h3>
                    <p className="text-sm text-foreground mt-1">
                      Unable to try on a different hoodie, pants, or shoes
                      without removing the previous one.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-500 mb-2">
                      Solutions:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Use rollback:</strong> Click the rollback
                          button to go back to a state before the current item
                          was added.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Cannot superimpose:</strong> Items from the
                          same category cannot be worn simultaneously. You must
                          remove one before trying another.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Plan comparisons:</strong> If comparing
                          similar items, save each outfit separately before
                          rolling back.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue 5 */}
            <div className="border border-neutral-500/10 rounded-xl overflow-hidden">
              <div className="bg-neutral-500/10 p-4 border-b border-neutral-500/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Background is Darker or Changed
                    </h3>
                    <p className="text-sm text-foreground mt-1">
                      The background behind the avatar darkens or changes with
                      each try-on.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-500 mb-2">
                      Explanation:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      This is another AI limitation. During image regeneration,
                      the background may shift, darken, or change slightly. This
                      is normal behavior and doesn't affect the quality of the
                      clothing visualization. There's no workaround for this
                      issue—it's a byproduct of the AI's image generation
                      process.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue 6 */}
            <div className="border border-neutral-500/10 rounded-xl overflow-hidden">
              <div className="bg-neutral-500/10 p-4 border-b border-neutral-500/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Try-On Failed or Produced Strange Results
                    </h3>
                    <p className="text-sm text-foreground mt-1">
                      The try-on completely failed or produced nonsensical
                      results.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-500 mb-2">
                      Solutions:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Simplify the try-on:</strong> Reduce to 1-2
                          items maximum.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Try again:</strong> Sometimes a simple retry
                          produces better results.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Check your avatar:</strong> Ensure your base
                          avatar is clear and properly formed.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-foreground">•</span>
                        <span>
                          <strong>Contact support:</strong> If persistent
                          failures occur, reach out to our support team.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
