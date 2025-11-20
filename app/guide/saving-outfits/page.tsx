import Link from "next/link";
import { ChevronRight, Save, Share2, FolderOpen, Heart } from "lucide-react";

export default function SavingOutfitsPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-5xl font-bold tracking-tighter mb-2">
        Saving Outfits
      </h1>
      <p className="text-lg 2xl:text-xl text-muted-foreground mb-8 leading-[1.2]">
        Learn how to save, organize, and share your favorite outfit creations with
        My Outfit's powerful saving features.
      </p>

      <div className="space-y-10">
        {/* Why Save Outfits */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Why Save Your Outfits?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-blue-500 mb-2">
                Build a Virtual Wardrobe
              </h3>
              <p className="text-sm text-blue-500">
                Create a collection of outfits you love and can reference anytime
                before making actual purchases.
              </p>
            </div>
            <div className="bg-purple-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-purple-500 mb-2">
                Compare Styles
              </h3>
              <p className="text-sm text-purple-500">
                Save multiple versions of similar outfits to compare and decide
                which looks best on you.
              </p>
            </div>
            <div className="bg-green-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-green-500 mb-2">
                Share with Friends
              </h3>
              <p className="text-sm text-green-500">
                Get feedback from friends or family by sharing your saved outfits
                before purchasing.
              </p>
            </div>
            <div className="bg-orange-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-orange-500 mb-2">
                Track Favorites
              </h3>
              <p className="text-sm text-orange-500">
                Keep a wishlist of outfits you want to buy when you're ready to
                make a purchase.
              </p>
            </div>
          </div>
        </section>

        {/* How to Save */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Save className="w-6 h-6 text-primary" />
            <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight">
              How to Save an Outfit
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
                    Create Your Outfit
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Complete your try-on and ensure the outfit appears exactly as
                    you want it on your avatar.
                  </p>
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
                    Click the Save Button
                  </h3>
                  <p className="text-base text-muted-foreground">
                    In the AvatarHub, locate and click the "Save" button to save
                    the current outfit to your collection.
                  </p>
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
                    Name Your Outfit
                  </h3>
                  <p className="text-base text-muted-foreground mb-3">
                    Give your outfit a memorable name like "Summer Streetwear" or
                    "Casual Friday Look" to easily find it later.
                  </p>
                  <div className="bg-yellow-500/5 rounded-lg p-3">
                    <p className="text-sm text-yellow-500">
                      <strong>Tip:</strong> Use descriptive names that include the
                      occasion, season, or style to organize your collection.
                    </p>
                  </div>
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
                    Confirm and Save
                  </h3>
                  <p className="text-base text-muted-foreground">
                    Click "Confirm" and your outfit is saved! Access it anytime from
                    your profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Viewing Saved Outfits */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight">
              Viewing Your Saved Outfits
            </h2>
          </div>
          <p className="text-base text-muted-foreground mb-6">
            Access and manage all your saved outfits from your profile:
          </p>
          <div className="space-y-3">
            <div className="bg-primary/5 rounded-xl p-5">
              <h3 className="font-semibold text-primary mb-2">
                Access Your Collection
              </h3>
              <p className="text-sm text-primary">
                Navigate to your profile and click on "Saved Outfits" to view your
                complete collection. Browse through all your creations in one place.
              </p>
            </div>
            <div className="bg-primary/5 rounded-xl p-5">
              <h3 className="font-semibold text-primary mb-2">
                Re-apply Outfits
              </h3>
              <p className="text-sm text-primary">
                Click on any saved outfit to re-apply it to your current avatar.
                This lets you quickly recreate looks without selecting items again.
              </p>
            </div>
            <div className="bg-primary/5 rounded-xl p-5">
              <h3 className="font-semibold text-primary mb-2">
                Edit or Delete
              </h3>
              <p className="text-sm text-primary">
                Rename outfits, add notes, or delete ones you no longer want. Keep
                your collection organized and up-to-date.
              </p>
            </div>
          </div>
        </section>

        {/* Sharing Outfits */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight">
              Sharing Your Outfits
            </h2>
          </div>
          <p className="text-base text-muted-foreground mb-6">
            Share your favorite looks with friends, family, or social media:
          </p>
          <div className="space-y-4">
            <div className="border border-border rounded-xl p-6 bg-white dark:bg-black/50">
              <h3 className="text-lg font-semibold mb-2">Direct Link Sharing</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Each saved outfit gets a unique shareable link. Click the "Share"
                button to copy the link and send it to anyone.
              </p>
              <div className="bg-blue-500/5 rounded-lg p-3">
                <p className="text-sm text-blue-500">
                  Recipients can view your outfit even if they don't have a My
                  Outfit account.
                </p>
              </div>
            </div>

            <div className="border border-border rounded-xl p-6 bg-white dark:bg-black/50">
              <h3 className="text-lg font-semibold mb-2">
                Social Media Sharing
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Share directly to Instagram, Twitter, Facebook, or other platforms.
                Show off your style and inspire others!
              </p>
              <div className="bg-purple-500/5 rounded-lg p-3">
                <p className="text-sm text-purple-500">
                  Include the My Outfit watermark to credit the platform and help
                  others discover it.
                </p>
              </div>
            </div>

            <div className="border border-border rounded-xl p-6 bg-white dark:bg-black/50">
              <h3 className="text-lg font-semibold mb-2">
                Download as Image
              </h3>
              <p className="text-sm text-muted-foreground">
                Download your outfit as a high-quality image to save locally or
                share however you prefer.
              </p>
            </div>
          </div>
        </section>

        {/* Organization Tips */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Organization Tips
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            Keep your saved outfits organized with these strategies:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">🗂️ Name by Occasion</h3>
              <p className="text-sm text-muted-foreground">
                "Wedding Guest", "Job Interview", "Date Night" - organize by when
                you'd wear it.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">🌞 Name by Season</h3>
              <p className="text-sm text-muted-foreground">
                "Summer Beach Look", "Winter Layers" - group by seasonal
                appropriateness.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">🎨 Name by Style</h3>
              <p className="text-sm text-muted-foreground">
                "Streetwear Vibe", "Minimalist Look" - categorize by aesthetic or
                style type.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">❤️ Use Favorites</h3>
              <p className="text-sm text-muted-foreground">
                Mark your absolute favorite outfits with a favorite/heart icon for
                quick access.
              </p>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Saving Best Practices
          </h2>
          <div className="space-y-3">
            <div className="bg-green-500/5 rounded-xl p-4 border-l-4 border-green-500">
              <h3 className="font-semibold text-green-500 mb-2">
                Save Multiple Versions
              </h3>
              <p className="text-sm text-green-500">
                If you're torn between two similar outfits, save both! Compare them
                side-by-side later to make your final decision.
              </p>
            </div>
            <div className="bg-blue-500/5 rounded-xl p-4 border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-500 mb-2">
                Add Notes
              </h3>
              <p className="text-sm text-blue-500">
                Use the notes feature to remind yourself why you loved an outfit or
                what pieces you still need to purchase.
              </p>
            </div>
            <div className="bg-purple-500/5 rounded-xl p-4 border-l-4 border-purple-500">
              <h3 className="font-semibold text-purple-500 mb-2">
                Regular Cleanup
              </h3>
              <p className="text-sm text-purple-500">
                Periodically review and delete outfits you're no longer interested
                in to keep your collection focused.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Start Saving Your Looks</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Build your dream wardrobe with My Outfit's powerful saving features.
            Create, save, and share outfits that express your unique style.
          </p>
          <Link
            href="/browse/men"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Start Creating Outfits
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
