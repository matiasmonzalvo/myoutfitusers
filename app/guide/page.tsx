import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function GuidePage() {
  return (
    <div>
      {/* Introduction */}
      <section className="mb-12">
        <h1 className="text-4xl 2xl:text-[44px] font-bold tracking-tighter mb-2">
          Welcome to My Outfit
        </h1>
        <p className="text-base text-foreground mb-6 leading-[1.4]">
          Your ultimate virtual try-on platform where you can wear real products
          on your real self. Create your outfits and try them on before you buy.
          It allows you to see how real clothing items look on your personalized
          avatar. Try on products from hundreds of brands, create stunning
          outfits, and share them with the world—all before making a purchase.
        </p>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Quick Start</h2>
        <div className="space-y-2">
          <Link
            href="/guide/creating-avatar"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  1. Create Your Avatar
                </h3>
                <p className="text-muted-foreground">
                  Upload your photos and let AI generate your personalized
                  avatar
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          <Link
            href="/guide/partner-brands"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  2. Understand Partner Brands
                </h3>
                <p className="text-muted-foreground">
                  Learn about free try-ons from partner brands vs paid try-ons
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          <Link
            href="/guide/try-ons"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  3. Start Trying On
                </h3>
                <p className="text-muted-foreground">
                  Learn how to use try-ons and create your perfect outfit
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          <Link
            href="/guide/best-practices"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  4. Master Best Practices
                </h3>
                <p className="text-muted-foreground">
                  Get the most accurate results with proven strategies
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Popular Topics
        </h2>
        <div className="grid md:grid-cols-2 gap-2">
          <Link
            href="/guide/optimal-strategy"
            className="border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">
              Optimal Try-On Strategy
            </h3>
            <p className="text-sm text-muted-foreground">
              Learn the bottom-up approach for best results
            </p>
          </Link>

          <Link
            href="/guide/common-issues"
            className="border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Common Issues</h3>
            <p className="text-sm text-muted-foreground">
              Troubleshoot problems and find solutions
            </p>
          </Link>

          <Link
            href="/guide/packages"
            className="border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Try-On Packages</h3>
            <p className="text-sm text-muted-foreground">
              View pricing and choose the right package
            </p>
          </Link>

          <Link
            href="/guide/category-layering"
            className="border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Category Layering</h3>
            <p className="text-sm text-muted-foreground">
              Understand which items can be worn together
            </p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="border border-border rounded-2xl p-8 text-center bg-white dark:bg-black/50">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create your avatar, try on thousands of products, and discover your
            perfect style with My Outfit.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-4 py-2 bg-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Create Account
            </Link>
            <Link
              href="/"
              className="px-4 py-2 border border-border rounded-full font-semibold hover:bg-muted transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
