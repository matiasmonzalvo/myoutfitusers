import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function TryOnsPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-[44px] font-bold tracking-tighter mb-2">
        What are Try-Ons?
      </h1>
      <p className="text-base text-foreground mb-8 leading-[1.6]">
        Try-ons are the core feature of My Outfit, allowing you to visualize how
        products look on your personal avatar before making a purchase. A try-on
        is a virtual fitting session where you can see how clothing and
        accessories look on your avatar. The AI understands both the fit and
        design of each product, creating realistic visualizations. A sigle
        try-on can include multiple products. Whether you try on 1 item or 3
        items from non-partner brands, it counts as one try-on credit. However,
        we recommend trying on 1-2 items at a time for the best results.
        <br />
        <span className="text-green-500">
          Remember that the try-ons usage is only for non-partner brands'
          products. Partner brands offer free try-ons, so you don't need to use
          a try-on credit for them.
        </span>
      </p>

      <div className="space-y-10">
        {/* Overview */}
        <section>
          <div className="grid md:grid-cols-3 gap-4 p-4 bg-white dark:bg-black/50 rounded-xl border border-border">
            <div className="p-2">
              <div className="font-bold tracking-tighter text-foreground mb-2 text-3xl">
                1
              </div>
              <h3 className="font-semibold mb-2">Select Products</h3>
              <p className="text-base text-foreground">
                Click the + button on products you want to try on. They'll be
                added to your selected products.
              </p>
            </div>
            <div className="p-2">
              <div className="font-bold tracking-tighter text-foreground mb-2 text-3xl">
                2
              </div>
              <h3 className="font-semibold mb-2">Click "Wear It"</h3>
              <p className="text-base text-foreground">
                Press the "Wear It" button in the AvatarHub to apply the
                selected products to your avatar.
              </p>
            </div>
            <div className="p-2">
              <div className="font-bold tracking-tighter text-foreground mb-2 text-3xl">
                3
              </div>
              <h3 className="font-semibold mb-2">View Results</h3>
              <p className="text-base text-foreground">
                Wait for the AI to generate your outfit. Your avatar will be
                updated with the products you selected.
              </p>
            </div>
          </div>
        </section>

        {/* What the AI Understands */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            What the AI Understands
          </h2>
          <p className="text-base text-foreground mb-2">
            The AI model behind My Outfit is sophisticated and understands more
            than just visual design:
          </p>
          <div className="space-y-3">
            <div className="">
              <p className="text-base text-foreground">
                Product Fit: The AI understands how garments fit the
                body—whether they're oversized, slim-fit, cropped, or
                full-length.
              </p>
            </div>
            <div className="">
              <p className="text-base text-foreground">
                Design Details: It accurately reproduces logos, patterns,
                textures, and colors from product images.
              </p>
            </div>
            <div className="">
              <p className="text-base text-foreground">
                Layering Logic: The AI knows how different garments
                interact—jackets over hoodies, shoes under pants, etc.
              </p>
            </div>
            <div className="">
              <p className="text-base text-foreground">
                Body Proportions: It maintains your avatar's body shape and
                proportions while applying products.
              </p>
            </div>
          </div>
        </section>

        {/* Important Note */}
        <section>
          <div className="">
            <h3 className="font-bold tracking-tighter text-foreground mt-6 mb-2 text-3xl">
              Try-On Credits Explained
            </h3>
            <p className="text-base text-foreground">
              A single try-on can include multiple products. Whether you try on
              1 item or 3 items from non-partner brands, it counts as{" "}
              <strong>one try-on credit</strong>. However, we recommend trying
              on 1-2 items at a time for the best results.
            </p>
          </div>
        </section>

        {/* Next Steps */}
        <section className="grid md:grid-cols-2 gap-4">
          <Link
            href="/guide/packages"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Partner Brands</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn about My Outfit partner brands that offer free try-on
              credits.
            </p>
            <div className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              Partner Brands
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
          <Link
            href="/guide/how-to-use-tryons"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">How to Use Try-Ons</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn the step-by-step process of using try-ons effectively.
            </p>
            <div className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              Read Guide
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
