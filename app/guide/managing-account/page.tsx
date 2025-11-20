import Link from "next/link";
import { ChevronRight, User, CreditCard, Settings } from "lucide-react";

export default function ManagingAccountPage() {
  return (
    <div>
      <h1 className="text-4xl 2xl:text-5xl font-bold tracking-tighter mb-2">
        Managing Your Account
      </h1>
      <p className="text-lg 2xl:text-xl text-muted-foreground mb-8 leading-[1.2]">
        Learn how to manage your profile, track your try-on credits, update your
        avatar, and control your account settings.
      </p>

      <div className="space-y-10">
        {/* Profile Management */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight">
              Profile Management
            </h2>
          </div>
          <p className="text-base text-muted-foreground mb-6">
            Your profile contains your avatar, personal information, and preferences.
          </p>
          <div className="space-y-3">
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">View Your Profile</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Access your profile by clicking on your avatar or username in the
                top navigation bar.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Update Personal Information</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Change your display name, email preferences, and other account
                details in your profile settings.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Privacy Settings</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Control who can see your saved outfits and shared looks. Manage
                your privacy preferences to suit your comfort level.
              </p>
            </div>
          </div>
        </section>

        {/* Avatar Management */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight">
              Avatar Management
            </h2>
          </div>
          <p className="text-base text-muted-foreground mb-6">
            Your base avatar is the foundation of all your try-ons. Here's how to
            manage it:
          </p>
          <div className="bg-blue-500/5 rounded-xl p-6">
            <h3 className="font-semibold text-blue-500 mb-3">
              Updating Your Avatar
            </h3>
            <p className="text-sm text-blue-500 mb-3">
              If you want to create a new base avatar with different photos:
            </p>
            <ol className="space-y-2 text-sm text-blue-500">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>Go to your profile settings</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>Navigate to "Avatar Settings"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>Upload new full-body and face-closeup photos</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">4.</span>
                <span>
                  Use your regenerations to create and select the best avatar
                </span>
              </li>
            </ol>
          </div>
          <div className="bg-yellow-500/5 rounded-xl p-6 mt-4">
            <h3 className="font-semibold text-yellow-500 mb-2">
              Important: Avatar Photo Tips
            </h3>
            <p className="text-sm text-yellow-500 mb-3">
              For best results with your avatar:
            </p>
            <ul className="space-y-1 text-sm text-yellow-500">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Stand straight, facing the camera, arms at your sides
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Ensure both photos are from the same moment/session
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Use good lighting with a clear, simple background
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Wear fitted, neutral clothing to show your body shape
              </li>
            </ul>
          </div>
        </section>

        {/* Credits & Billing */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-primary" />
            <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight">
              Try-On Credits & Billing
            </h2>
          </div>
          <p className="text-base text-muted-foreground mb-6">
            Track your try-on credits and manage your purchases:
          </p>
          <div className="space-y-3">
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">View Credit Balance</h3>
              <p className="text-sm text-muted-foreground">
                Your current credit balance is displayed in the AvatarHub and in
                your profile. Check it anytime to see how many try-ons you have
                remaining.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Purchase History</h3>
              <p className="text-sm text-muted-foreground">
                Access your purchase history in your account settings to view all
                past credit package purchases and transactions.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Buy More Credits</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Running low on credits? Purchase more anytime from the pricing page.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
              >
                View Pricing Plans
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Saved Outfits */}
        <section>
          <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight mb-4">
            Managing Saved Outfits
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            Save your favorite looks and outfits for future reference:
          </p>
          <div className="space-y-3">
            <div className="bg-green-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-green-500 mb-2">
                Saving an Outfit
              </h3>
              <p className="text-sm text-green-500">
                After creating an outfit you love, click the "Save" button in the
                AvatarHub. Give it a name for easy retrieval later.
              </p>
            </div>
            <div className="bg-purple-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-purple-500 mb-2">
                Viewing Saved Outfits
              </h3>
              <p className="text-sm text-purple-500">
                Access all your saved outfits from your profile. Browse through
                your collection and re-apply any saved look to your avatar.
              </p>
            </div>
            <div className="bg-blue-500/5 rounded-xl p-5">
              <h3 className="font-semibold text-blue-500 mb-2">
                Sharing Outfits
              </h3>
              <p className="text-sm text-blue-500">
                Share your favorite outfits with friends or on social media using
                the share button. Each outfit gets a unique link.
              </p>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-2xl 2xl:text-3xl font-bold tracking-tight">
              Account Settings
            </h2>
          </div>
          <div className="space-y-3">
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Email Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Control which emails you receive from My Outfit, including
                promotional offers, new brand announcements, and product updates.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Notification Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage in-app notifications for try-on completions, credit
                reminders, and new feature announcements.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Change Password</h3>
              <p className="text-sm text-muted-foreground">
                Update your account password for security. We recommend using a
                strong, unique password.
              </p>
            </div>
            <div className="border border-border rounded-xl p-5 bg-white dark:bg-black/50">
              <h3 className="font-semibold mb-2">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                If you wish to delete your account, contact our support team. Note
                that this action is permanent and cannot be undone.
              </p>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-3">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            If you have questions about managing your account or need assistance
            with any settings, our support team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Contact Support
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Next Steps */}
        <section className="grid md:grid-cols-2 gap-4">
          <Link
            href="/guide/purchasing-tryons"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Purchasing Try-Ons</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn how to purchase try-on credits and understand our payment
              process.
            </p>
            <div className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
              Read Guide
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
          <Link
            href="/guide/saving-outfits"
            className="block border border-border rounded-xl p-6 bg-white dark:bg-black/50 hover:opacity-80 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Saving Outfits</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discover how to save, organize, and share your favorite outfit
              creations.
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
