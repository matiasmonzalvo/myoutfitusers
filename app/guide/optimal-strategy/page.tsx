import Link from "next/link";
import { ChevronRight, Target, Zap } from "lucide-react";

export default function OptimalStrategyPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-5xl font-bold tracking-tighter mb-2">
        Optimal Try-On Strategy
      </h1>
      <p className="text-lg 2xl:text-xl text-muted-foreground mb-8 leading-[1.2]">
        Master the art of virtual try-ons with advanced strategies designed to
        maximize accuracy, efficiency, and credit usage.
      </p>

      <div className="space-y-10">
        {/* Strategy Overview */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-6">
            The Perfect Try-On Workflow
          </h2>
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 mb-6">
            <p className="text-base text-muted-foreground">
              Follow this battle-tested workflow to achieve the best results with
              the fewest credits and iterations.
            </p>
          </div>

          <div className="space-y-4">
            {/* Phase 1 */}
            <div className="border-l-4 border-blue-500 bg-blue-500/5 rounded-r-xl p-6">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-500 mb-2">
                    Phase 1: Foundation (Sneakers)
                  </h3>
                  <p className="text-sm text-blue-500 mb-3">
                    Always start with footwear. Sneakers provide the foundation and
                    help the AI understand proportions and perspective.
                  </p>
                  <div className="bg-blue-500/10 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-500 mb-1">
                      Why sneakers first?
                    </p>
                    <p className="text-sm text-blue-500">
                      The AI uses footwear as an anchor point for positioning other
                      garments. This ensures better fit and proportion accuracy for
                      all subsequent items.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="border-l-4 border-purple-500 bg-purple-500/5 rounded-r-xl p-6">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-purple-500 mb-2">
                    Phase 2: Lower Body (Pants/Shorts)
                  </h3>
                  <p className="text-sm text-purple-500 mb-3">
                    Add pants, jeans, or shorts. The AI will drape them correctly
                    over the sneakers you've already established.
                  </p>
                  <div className="bg-purple-500/10 rounded-lg p-3">
                    <p className="text-sm font-semibold text-purple-500 mb-1">
                      Pro Tip:
                    </p>
                    <p className="text-sm text-purple-500">
                      You can try sneakers + pants together in one session if both
                      are simple designs. This saves a credit if you're using
                      non-partner brands.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="border-l-4 border-green-500 bg-green-500/5 rounded-r-xl p-6">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-500 mb-2">
                    Phase 3: Base Layer (T-Shirt/Hoodie)
                  </h3>
                  <p className="text-sm text-green-500 mb-3">
                    Add your main upper body garment. Hoodies, t-shirts, or shirts
                    should be tried on individually for best results.
                  </p>
                  <div className="bg-green-500/10 rounded-lg p-3">
                    <p className="text-sm font-semibold text-green-500 mb-1">
                      Detailed Garments:
                    </p>
                    <p className="text-sm text-green-500">
                      If the item has complex graphics, multiple logos, or intricate
                      patterns, try it on solo without other upper body items.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="border-l-4 border-orange-500 bg-orange-500/5 rounded-r-xl p-6">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-500 mb-2">
                    Phase 4: Outer Layer (Jacket/Coat)
                  </h3>
                  <p className="text-sm text-orange-500 mb-3">
                    Add jackets, coats, or vests as the final clothing layer. These
                    should be tried on after all base layers are established.
                  </p>
                  <div className="bg-orange-500/10 rounded-lg p-3">
                    <p className="text-sm font-semibold text-orange-500 mb-1">
                      Layering Order:
                    </p>
                    <p className="text-sm text-orange-500">
                      The AI understands layering hierarchy. It will correctly place
                      jackets over hoodies and shirts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 5 */}
            <div className="border-l-4 border-pink-500 bg-pink-500/5 rounded-r-xl p-6">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-pink-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-pink-500 mb-2">
                    Phase 5: Accessories (Optional)
                  </h3>
                  <p className="text-sm text-pink-500 mb-3">
                    Finish with accessories like hats, bags, jewelry, or
                    sunglasses. These are best added last as finishing touches.
                  </p>
                  <div className="bg-pink-500/10 rounded-lg p-3">
                    <p className="text-sm font-semibold text-pink-500 mb-1">
                      Keep It Simple:
                    </p>
                    <p className="text-sm text-pink-500">
                      Accessories work best when the main outfit is already
                      complete. Avoid adding too many at once.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Techniques */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Advanced Techniques
          </h2>
          <div className="space-y-4">
            <div className="bg-primary/5 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-primary mb-2">
                    The Two-Item Power Combo
                  </h3>
                  <p className="text-sm text-primary mb-2">
                    For maximum efficiency with non-partner brands, try these
                    proven two-item combinations:
                  </p>
                  <ul className="space-y-1 text-sm text-primary">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      Sneakers + Pants (builds lower body foundation)
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      Hoodie + Pants (if sneakers are already on)
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      T-Shirt + Jacket (simple layering)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-primary mb-2">
                    Strategic Rollback Usage
                  </h3>
                  <p className="text-sm text-primary mb-2">
                    Use rollback intelligently to test variations without wasting
                    credits:
                  </p>
                  <ul className="space-y-1 text-sm text-primary">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      Build base with partner brands (free)
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      Rollback one step to swap a single item
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      Test non-partner brand variations on solid base
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-primary mb-2">
                    Brand Separation Strategy
                  </h3>
                  <p className="text-sm text-primary mb-2">
                    Prevent logo contamination by grouping items strategically:
                  </p>
                  <ul className="space-y-1 text-sm text-primary">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      Try famous brand items alone or with other famous brands
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      Group lesser-known brands together
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      Layer unknown brands over known brands (safer than reverse)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scenario Examples */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Real-World Scenarios
          </h2>
          <div className="space-y-4">
            <div className="border border-border rounded-xl p-6 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-3">
                Scenario 1: Building a Streetwear Outfit
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  Try on Nike Air Force 1 (partner brand, free)
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  Add Levi's 501 jeans (non-partner, 1 credit)
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  Try Supreme box logo hoodie alone (famous brand, 1 credit)
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">4.</span>
                  Add The North Face puffer jacket (partner brand, free)
                </li>
              </ol>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-semibold">
                  Total credits used: 2 | Result: Complete streetwear outfit
                </p>
              </div>
            </div>

            <div className="border border-border rounded-xl p-6 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-3">
                Scenario 2: Testing Multiple Sneaker Options
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  Try Jordan 1 (partner brand, free) + basic pants
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  Rollback to base avatar
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  Try Yeezy 350 (partner brand, free) + same pants
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-foreground">4.</span>
                  Compare and decide which sneaker works better
                </li>
              </ol>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-semibold">
                  Total credits used: 0 | Result: Found perfect sneaker choice
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Quick Reference Guide
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-500/5 rounded-xl p-4">
              <h3 className="font-semibold text-green-500 mb-2">
                ✓ Do This
              </h3>
              <ul className="space-y-1 text-sm text-green-500">
                <li>• Start with sneakers</li>
                <li>• Try detailed items alone</li>
                <li>• Build gradually layer by layer</li>
                <li>• Use partner brands for experimentation</li>
                <li>• Save successful outfits</li>
              </ul>
            </div>
            <div className="bg-red-500/5 rounded-xl p-4">
              <h3 className="font-semibold text-red-500 mb-2">
                ✕ Avoid This
              </h3>
              <ul className="space-y-1 text-sm text-red-500">
                <li>• Trying 3+ detailed items together</li>
                <li>• Mixing famous with unknown brands</li>
                <li>• Skipping the sneaker foundation</li>
                <li>• Rushing without planning</li>
                <li>• Ignoring rollback opportunities</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <Link
            href="/guide/category-layering"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">
              Understanding Category Layering
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn which product categories can be layered and which cannot for
              perfect outfit combinations.
            </p>
            <div className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              Learn About Layering
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
