import { Header } from "@/components/layout/header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="bg-background">
      <main className="w-full mx-auto relative h-full overflow-x-hidden">
        <div className="md:w-full">
          <section className="flex flex-col min-h-screen w-full pt-4">
            <div className="lg:px-0 px-4">
              <h1 className="text-4xl lg:text-5xl font-[600] text-left tracking-tighter text-foreground mb-4">
                About Us
              </h1>

              <div className="prose prose-invert max-w-none">
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  At My Outfit, we believe fashion and technology can coexist in
                  a way that forever changes how people experience clothing. Our
                  story began with a simple question: Why should people have to
                  imagine how they'd look in something — when they could
                  actually see it?
                </p>

                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  From that idea, we built a platform powered by artificial
                  intelligence that lets users try on real brand products
                  instantly, accurately, and effortlessly — from anywhere in the
                  world.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Redefining Online Shopping
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  For years, online shopping has looked the same: photos, sizes,
                  and descriptions — but never a true "try-on" experience. My
                  Outfit redefines that. Our AI technology generates realistic
                  visualizations of each user wearing the items they choose,
                  allowing them to explore combinations, experiment with styles,
                  and see complete outfits before making a decision. What used
                  to be guesswork is now a reliable, personal, and immersive
                  experience.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  More Than a Tool — A Community
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  But My Outfit is more than a tool — it's a community. Users
                  can create, save, and share their outfits, explore others'
                  creations, and discover new trends directly from real people.
                  Every outfit becomes an act of expression and creativity,
                  fueling a new kind of social interaction inside the digital
                  fashion world.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Our Mission
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  Our mission is clear: to revolutionize the way people try on
                  products, removing the distance between the user and the
                  brand, between inspiration and decision. At the same time, we
                  give brands a unique opportunity to showcase their products in
                  real, authentic contexts — not on models, but on the people
                  who actually love and wear them.
                </p>

                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  The Future of Getting Dressed
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mb-6">
                  My Outfit represents the future of getting dressed digitally.
                  It's a platform that doesn't just display clothes — it brings
                  them to life through the person wearing them. Every detail,
                  from visual precision to user experience, is designed with one
                  goal: to make trying on something new not a barrier, but the
                  beginning of a new way to express yourself.
                </p>

                <p className="text-sm lg:text-base text-muted-foreground mb-6 italic">
                  Because fashion is not about what you wear — it's about how it
                  makes you feel.
                </p>

                <p className="text-sm lg:text-base text-muted-foreground mb-6 font-medium">
                  And now, for the first time, you can truly see that feeling.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
