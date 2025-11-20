import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl 2xl:text-6xl font-bold tracking-tight mb-4">
            About My Outfit
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The future of online shopping is here. Try on real products on your
            personalized avatar before you buy.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            My Outfit is revolutionizing the way people shop for clothes online.
            We believe that everyone deserves to see how clothing will actually
            look on them before making a purchase—not just on generic models.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            By leveraging cutting-edge AI technology, we create personalized
            avatars that accurately represent your body shape and features,
            allowing you to virtually try on thousands of products from hundreds
            of brands.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            How It Works
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Create Your Avatar
                </h3>
                <p className="text-muted-foreground">
                  Upload two photos and our AI generates a realistic 3D avatar
                  that looks just like you.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Browse & Select Products
                </h3>
                <p className="text-muted-foreground">
                  Explore thousands of products from your favorite brands and
                  add them to your virtual fitting room.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Try On & Share</h3>
                <p className="text-muted-foreground">
                  See how products look on your avatar, create stunning outfits,
                  and share them with friends before purchasing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why My Outfit */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            Why My Outfit?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">
                Personalized Experience
              </h3>
              <p className="text-sm text-muted-foreground">
                Unlike traditional online shopping where you see clothes on
                random models, you see them on YOUR avatar, giving you a true
                sense of how they'll look on you.
              </p>
            </div>

            <div className="border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Reduce Returns</h3>
              <p className="text-sm text-muted-foreground">
                By seeing products on your avatar first, you can make more
                confident purchasing decisions and reduce the likelihood of
                returns.
              </p>
            </div>

            <div className="border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">
                Official Products Only
              </h3>
              <p className="text-sm text-muted-foreground">
                Every product on our platform is official and links directly to
                authorized retailers. We never sell counterfeit items.
              </p>
            </div>

            <div className="border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">
                Partner Brand Benefits
              </h3>
              <p className="text-sm text-muted-foreground">
                Try on products from partner brands completely free. We're
                working to make all brands on the platform partners.
              </p>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Our Technology
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            My Outfit is built on advanced artificial intelligence and computer
            vision technology. Our AI models understand not just the appearance
            of clothing, but also how fabrics drape, how different fits work, and
            how garments layer together.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We're constantly improving our models to provide more accurate and
            realistic try-on experiences. As a startup in our early stages, we
            appreciate your feedback and patience as we continue to refine and
            enhance the platform.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="border border-border rounded-2xl p-8 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already using My Outfit to discover
              their perfect style.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Create Account
              </Link>
              <Link
                href="/guide"
                className="px-6 py-3 border border-border rounded-full font-semibold hover:bg-muted transition-colors"
              >
                Read Guide
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


