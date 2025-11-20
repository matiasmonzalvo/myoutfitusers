import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function UnderstandingPlatformPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-[44px] font-bold tracking-tighter mb-2">
        Understanding the Platform
      </h1>
      <p className="text-base text-foreground mb-8 leading-[1.4]">
        My Outfit features products from hundreds of brands across various
        categories including apparel, footwear, and accessories.
      </p>

      <div className="space-y-10">
        {/* Official Products */}
        <section>
          <div className="">
            <h2 className="font-bold tracking-tighter text-foreground mt-6 mb-2 text-3xl">
              Official Products Only
            </h2>
            <p className="text-base text-foreground">
              Every product on the platform is official and links directly to
              the brand's website or authorized retailer. When you click on a
              product, you'll be taken to the official purchase page.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mt-6 mb-2">
            Browse by Category
          </h2>
          <p className="text-base text-foreground mb-6">
            Products are organized into categories for easy browsing:
          </p>
          <div className="grid md:grid-cols-2 gap-2">
            <div className="border border-border rounded-xl p-4 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Tops & T-shirts</h3>
              <p className="text-base text-foreground">
                T-shirts, shirts, blouses, sweaters, and more
              </p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Bottoms & Pants</h3>
              <p className="text-base text-foreground">
                Jeans, pants, shorts, skirts, and leggings
              </p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Outerwear & Jackets</h3>
              <p className="text-base text-foreground">
                Jackets, coats, hoodies, and cardigans
              </p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Footwear & Sneakers</h3>
              <p className="text-base text-foreground">
                Sneakers, shoes, boots, and sandals
              </p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Accessories</h3>
              <p className="text-base text-foreground">
                Hats, bags, sunglasses, jewelry, and more
              </p>
            </div>
          </div>
        </section>

        {/* Product Information */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Product Information
          </h2>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <div>
                <strong className="text-foreground">Product image:</strong>
                <span className="text-foreground">
                  {" "}
                  The official product photo from the brand
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <div>
                <strong className="text-foreground">Product name:</strong>
                <span className="text-foreground">
                  {" "}
                  The official name of the product
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <div>
                <strong className="text-foreground">Brand logo:</strong>
                <span className="text-foreground">
                  {" "}
                  Shows which brand makes the product
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <div>
                <strong className="text-foreground">Verified badge:</strong>
                <span className="text-foreground">
                  {" "}
                  Green for partner brands (free try-ons), gray for non-partner
                  brands
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <div>
                <strong className="text-foreground">Plus button:</strong>
                <span className="text-foreground">
                  {" "}
                  Click to add the product to your try-on selection
                </span>
              </div>
            </li>
          </ul>
        </section>

        {/* Next Steps */}
        <section>
          <Link
            href="/guide/try-ons"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Now that you understand the platform, learn how to use try-ons.
            </p>
            <div className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              What are Try-Ons
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
