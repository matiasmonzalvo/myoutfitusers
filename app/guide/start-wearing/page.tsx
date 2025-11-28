import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Plus,
  Sparkles,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

export default function StartWearingPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-[44px] font-bold tracking-tighter mb-2">
        Getting Started with Try-Ons
      </h1>
      <p className="text-base text-foreground mb-4 leading-[1.6]">
        Learn how to use My Outfit to try on clothing items on your avatar.
        Follow these simple steps to start wearing any product you like.
      </p>
      <section>
        <div className="bg-primary/5 rounded-3xl p-3 lg:p-6 mb-8">
          <div className="flex items-start">
            <div>
              <h3 className="font-bold text-xl mb-3">
                Important Things to Keep in Mind
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground">
                    <strong>For optimal results:</strong> Check out our{" "}
                    <Link
                      href="/guide/best-practices"
                      className="text-primary font-semibold hover:underline"
                    >
                      Best Practices
                    </Link>{" "}
                    guide to learn expert tips and recommendations that will
                    help you achieve the highest success rate when generating
                    outfits. Following these guidelines will ensure your try-ons
                    look accurate and realistic.
                  </p>
                </div>

                <div>
                  <p className="text-sm text-foreground">
                    <strong>Troubleshooting:</strong> If you encounter any
                    issues with the AI or the platform, visit our{" "}
                    <Link
                      href="/guide/common-issues"
                      className="text-primary font-semibold hover:underline"
                    >
                      Common Issues
                    </Link>{" "}
                    page. There you'll find solutions to frequent problems and
                    explanations for any unexpected behavior you might
                    experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="space-y-10">
        {/* Step by Step Guide */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            How to Try On Clothing Items
          </h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="mb-20">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-semibold">
                  1 - Add Products to Selection
                </h3>
              </div>
              <p className="text-base text-foreground mb-4">
                Browse through the product catalog and find items you want to
                try on. When you find a product you like, click the{" "}
                <span className="inline-flex items-center gap-1 bg-primary text-white px-0.5 py-0.5 rounded-full font-medium">
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                </span>{" "}
                on the product card. This will add the item to your selected
                products, which appear in the AvatarHub panel.
              </p>
              <div className="bg-muted/50 rounded-xl overflow-hidden aspect-[5/3] flex items-center justify-center border border-border">
                <img
                  src="/step1.png"
                  alt="Step 1"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-semibold">
                  2 - Click "Wear It" and Wait
                </h3>
              </div>
              <p className="text-base text-foreground mb-4">
                Once you've selected your products, click the{" "}
                <span className="inline-flex items-center gap-1 bg-primary text-white px-3 py-0.5 rounded-full font-medium">
                  Wear It
                </span>{" "}
                button in the AvatarHub. The AI will process your request and
                virtually dress your avatar with the selected items. This
                usually takes a few seconds, so just wait for the magic to
                happen!
              </p>
              <div className="bg-[#171717] rounded-xl overflow-hidden aspect-[5/3] flex items-center justify-center border border-border">
                <img
                  src="/step2.png"
                  alt="Step 2"
                  className="w-auto h-full relative object-contain"
                />
              </div>
            </div>

            <div className="mb-20">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-semibold">
                  3 - View Your New Look
                </h3>
              </div>
              <p className="text-base text-foreground mb-4">
                Once the AI finishes processing, your avatar will be updated
                with the clothing items you selected. You can now see exactly
                how the products look on you! From here, you can continue adding
                more items, save your outfit, or start fresh with new products.
              </p>
              <div className="bg-[#171717] rounded-xl overflow-hidden aspect-[5/3] flex items-center justify-center border border-border">
                <img
                  src="/step3.png"
                  alt="Step 3"
                  className="w-auto h-full relative object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="grid md:grid-cols-2 gap-4">
          <Link
            href="/guide/best-practices"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn expert tips to maximize your try-on success rate.
            </p>
            <div className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              Read Guide
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
          <Link
            href="/guide/common-issues"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Common Issues</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Find solutions to frequent problems and troubleshoot issues.
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
