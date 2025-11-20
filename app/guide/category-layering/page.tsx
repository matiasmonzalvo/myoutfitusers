import Link from "next/link";
import { ChevronRight, Layers, X } from "lucide-react";

export default function CategoryLayeringPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-5xl font-bold tracking-tighter mb-2">
        Category Layering
      </h1>
      <p className="text-lg 2xl:text-xl text-muted-foreground mb-8 leading-[1.2]">
        Understand which product categories can be layered together and which
        cannot to create perfect outfit combinations.
      </p>

      <div className="space-y-10">
        {/* Core Concept */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            The Layering Rule
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            My Outfit follows a simple but important rule:
          </p>
          <div className="bg-blue-500/5 rounded-xl p-6 border-l-4 border-blue-500">
            <p className="text-lg font-semibold text-blue-500">
              You cannot superimpose items from the same category.
            </p>
            <p className="text-sm text-blue-500 mt-2">
              This means you can't wear two hoodies at once, two pairs of pants, or
              two jackets. You must rollback to remove the first item before trying
              on another from the same category.
            </p>
          </div>
        </section>

        {/* What Can Layer */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            What CAN Layer Together
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            Items from different categories can be layered to create complete
            outfits:
          </p>
          <div className="space-y-3">
            <div className="bg-green-500/5 rounded-xl p-4 border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-500 mb-2">
                    Footwear + Pants
                  </h3>
                  <p className="text-sm text-green-500">
                    Sneakers, shoes, or boots can be worn with pants, jeans, shorts,
                    or skirts simultaneously.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/5 rounded-xl p-4 border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-500 mb-2">
                    Base Layer + Outer Layer
                  </h3>
                  <p className="text-sm text-green-500">
                    T-shirts or hoodies can be layered under jackets, coats, or
                    vests.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/5 rounded-xl p-4 border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-500 mb-2">
                    Clothing + Accessories
                  </h3>
                  <p className="text-sm text-green-500">
                    Any clothing can be combined with accessories like hats, bags,
                    jewelry, or sunglasses.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/5 rounded-xl p-4 border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-500 mb-2">
                    Full Outfits
                  </h3>
                  <p className="text-sm text-green-500">
                    You can combine sneakers + pants + shirt + jacket + hat all at
                    once, as they're all different categories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Cannot Layer */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            What CANNOT Layer Together
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            Items from the same category cannot be worn simultaneously:
          </p>
          <div className="space-y-3">
            <div className="bg-red-500/5 rounded-xl p-4 border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-500 mb-2">
                    Multiple Upper Body Items (Same Type)
                  </h3>
                  <p className="text-sm text-red-500">
                    You can't wear two t-shirts, two hoodies, or two sweatshirts at
                    once. Choose one.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-500/5 rounded-xl p-4 border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-500 mb-2">
                    Multiple Outer Layers (Same Type)
                  </h3>
                  <p className="text-sm text-red-500">
                    You can't wear two jackets or two coats simultaneously. Pick the
                    one you want to showcase.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-500/5 rounded-xl p-4 border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-500 mb-2">
                    Multiple Lower Body Items
                  </h3>
                  <p className="text-sm text-red-500">
                    You can't wear two pairs of pants, jeans, or shorts at once.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-500/5 rounded-xl p-4 border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-500 mb-2">
                    Multiple Footwear
                  </h3>
                  <p className="text-sm text-red-500">
                    You can't wear two pairs of sneakers or shoes simultaneously.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Product Categories Explained
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            Here's a breakdown of major product categories and how they interact:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-3">👟 Footwear</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Includes: Sneakers, shoes, boots, sandals
              </p>
              <p className="text-xs text-muted-foreground">
                Can layer with: Pants, shorts, skirts, all upper body items
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-3">👖 Lower Body</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Includes: Pants, jeans, shorts, skirts, leggings
              </p>
              <p className="text-xs text-muted-foreground">
                Can layer with: Footwear, all upper body items, accessories
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-3">👕 Base Upper Body</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Includes: T-shirts, long-sleeves, hoodies, sweatshirts, tank tops
              </p>
              <p className="text-xs text-muted-foreground">
                Can layer with: Pants, footwear, outer layers (jackets), accessories
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-3">🧥 Outer Layers</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Includes: Jackets, coats, blazers, vests, bombers
              </p>
              <p className="text-xs text-muted-foreground">
                Can layer with: All base layers, pants, footwear, accessories
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-3">🎩 Headwear</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Includes: Hats, caps, beanies, headbands
              </p>
              <p className="text-xs text-muted-foreground">
                Can layer with: All clothing items
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-3">👜 Accessories</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Includes: Bags, jewelry, sunglasses, watches, belts
              </p>
              <p className="text-xs text-muted-foreground">
                Can layer with: All clothing items
              </p>
            </div>
          </div>
        </section>

        {/* Practical Examples */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Practical Examples
          </h2>
          <div className="space-y-4">
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold text-green-500 mb-3">
                ✓ Valid Outfit Combination
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-foreground">•</span>
                  <span>Air Jordan 1 (Footwear)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-foreground">•</span>
                  <span>Levi's 501 Jeans (Lower Body)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-foreground">•</span>
                  <span>Supreme Box Logo Hoodie (Base Upper Body)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-foreground">•</span>
                  <span>North Face Puffer Jacket (Outer Layer)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-foreground">•</span>
                  <span>New Era Cap (Headwear)</span>
                </li>
              </ul>
              <p className="text-xs text-green-500 mt-3">
                This works because each item is from a different category.
              </p>
            </div>

            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold text-red-500 mb-3">
                ✕ Invalid Outfit Combination
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-foreground">•</span>
                  <span>Nike Air Max (Footwear)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-foreground">•</span>
                  <span>Cargo Pants (Lower Body)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-foreground">•</span>
                  <span className="line-through">Essentials Hoodie + Carhartt Hoodie (Base Upper Body)</span>
                </li>
              </ul>
              <p className="text-xs text-red-500 mt-3">
                This fails because you're trying to wear two hoodies from the same
                category.
              </p>
            </div>
          </div>
        </section>

        {/* How to Handle */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            How to Try Different Items from Same Category
          </h2>
          <div className="bg-orange-500/5 rounded-xl p-6 border-l-4 border-orange-500">
            <h3 className="font-semibold text-orange-500 mb-3">
              Use the Rollback Feature
            </h3>
            <p className="text-sm text-orange-500 mb-3">
              If you want to try a different hoodie after already wearing one:
            </p>
            <ol className="space-y-2 text-sm text-orange-500">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>Click the "Rollback" button in AvatarHub</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>
                  Continue rolling back until you reach a state before the hoodie
                  was added
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>Select the new hoodie and try it on</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">4.</span>
                <span>Compare saved versions to decide which looks better</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <Link
            href="/guide/managing-account"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Manage Your Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn how to manage your profile, track your try-on credits, and
              update your preferences.
            </p>
            <div className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              Account Management
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
