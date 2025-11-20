import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function CreatingAvatarPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-[44px] font-bold tracking-tighter mb-2">
        Creating Your Avatar
      </h1>
      <p className="text-base text-foreground mb-8 leading-[1.4]">
        Your avatar is the foundation of your My Outfit experience. The quality
        of your base avatar directly impacts how well clothes will look on you
        throughout the platform.
      </p>

      <div className="space-y-10">
        {/* Required Photos */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Required Photos
          </h2>
          <p className="text-base text-foreground mb-4">
            You'll need to upload two photos during onboarding:
          </p>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div>
                <strong className="text-foreground">Full-body photo:</strong>
                <span className="text-foreground">
                  {" "}
                  Stand straight, arms at your sides, looking at the camera.
                  This is the most important photo as the AI uses it to
                  understand your body shape and proportions.
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <div>
                <strong className="text-foreground">
                  Close-up face photo:
                </strong>
                <span className="text-foreground">
                  {" "}
                  A clear photo of your face. Ideally taken at the same time as
                  your full-body photo to avoid confusing the AI with different
                  lighting or appearance.
                </span>
              </div>
            </li>
          </ul>
        </section>

        {/* Avatar Regenerations */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Avatar Regenerations
          </h2>
          <p className="text-base text-foreground mb-4">
            You have{" "}
            <strong className="text-foreground">3 regeneration attempts</strong>{" "}
            during onboarding. If you're not satisfied with your initial avatar,
            you can upload different photos and regenerate it.
          </p>
          <p className="text-base text-foreground mb-8">
            After using all 3 regenerations, you can review all generated
            avatars and select the one that works best for you.
          </p>

          <div className="">
            <h4 className="font-bold tracking-tighter text-foreground mt-6 mb-2 text-3xl">
              Experiment with Different Photos
            </h4>
            <p className="text-base text-foreground">
              Don't be afraid to try different photo combinations. Sometimes a
              different angle or lighting can produce significantly better
              results. Use all 3 regenerations to find your perfect avatar.
            </p>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <Link
            href="/guide/understanding-platform"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
            <p className="text-sm text-muted-foreground mb-4">
              After creating your avatar, you're ready to start exploring the
              platform and trying on products.
            </p>
            <div className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              Understanding the Platform
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
