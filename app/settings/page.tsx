"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createServerClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  User,
  Palette,
  Image as ImageIcon,
  Upload,
  Monitor,
  Moon,
  Sun,
  UserRound,
  PersonStanding,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { UserProfile } from "@/lib/types/user";
import Image from "next/image";

type SettingsTab = "profile" | "theme" | "base-avatar";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile tab state
  const [username, setUsername] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null
  );
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  const router = useRouter();
  const supabase = createServerClient();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        setError("Failed to load profile");
        return;
      }

      setProfile(profileData);
      setUsername(profileData.username);
      setProfilePhotoPreview(profileData.profile_photo_url);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    if (usernameToCheck === profile?.username) {
      setUsernameAvailable(true);
      return;
    }

    setUsernameChecking(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("username, id")
        .eq("username", usernameToCheck)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setUsernameAvailable(!data);
    } catch (err) {
      console.error("Error checking username:", err);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(sanitized);

    if (sanitized.length >= 3 && sanitized !== profile?.username) {
      setTimeout(() => {
        checkUsernameAvailability(sanitized);
      }, 500);
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear any previous errors
    setError("");
    setSuccess("");

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setProfilePhotoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadProfilePhoto = async (
    userId: string,
    file: File
  ): Promise<string | null> => {
    try {
      // Delete old photo if exists
      if (profile?.profile_photo_url) {
        const oldPath = profile.profile_photo_url.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("profile-photos")
            .remove([`${userId}/${oldPath}`]);
        }
      }

      // Upload new photo
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/profile.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Error uploading profile photo:", err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (usernameAvailable === false) {
      setError("This username is already taken");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        return;
      }

      let photoUrl = profile.profile_photo_url;

      // Upload profile photo if changed
      if (profilePhotoFile) {
        setUploadingPhoto(true);
        try {
          const uploadedUrl = await uploadProfilePhoto(
            user.id,
            profilePhotoFile
          );
          if (uploadedUrl) {
            photoUrl = uploadedUrl;
          }
        } catch (uploadErr) {
          setError("Failed to upload profile photo. Please try again.");
          return;
        } finally {
          setUploadingPhoto(false);
        }
      }

      // Prepare update data
      const updateData: any = {};

      if (username !== profile.username) {
        updateData.username = username;
      }

      if (photoUrl !== profile.profile_photo_url) {
        updateData.profile_photo_url = photoUrl;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update(updateData)
          .eq("id", user.id);

        if (updateError) {
          if (updateError.code === "23505") {
            setError("This username is already taken");
          } else {
            setError(`Error updating profile: ${updateError.message}`);
          }
          return;
        }
      }

      setSuccess("Profile updated successfully");
      setProfilePhotoFile(null);
      await loadProfile();

      // Refresh the page to update the avatar in the header
      router.refresh();
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  };

  const menuItems: Array<{
    id: SettingsTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "profile",
      label: "Profile",
      icon: <UserRound className="h-4 w-4" />,
    },
    { id: "theme", label: "Theme", icon: <Palette className="h-4 w-4" /> },
    {
      id: "base-avatar",
      label: "Base Avatar",
      icon: <PersonStanding className="h-4 w-4" />,
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-52 flex-shrink-0">
          <nav className="space-y-1 bg-background rounded-2xl py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-muted text-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-muted "
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1">
          <div className="bg-white dark:bg-black/50 border border-border rounded-2xl p-6 lg:p-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                    Profile Settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Update your profile information
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Profile Photo Section */}
                <div className="space-y-4">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-2 border-border overflow-hidden bg-muted">
                        {profilePhotoPreview ? (
                          <Image
                            src={profilePhotoPreview}
                            alt="Profile"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id="profile-photo-upload"
                        accept="image/*"
                        onChange={handleProfilePhotoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document
                            .getElementById("profile-photo-upload")
                            ?.click()
                        }
                        className="rounded-full"
                        disabled={uploadingPhoto}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG or WEBP. Max 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                {/* Username Section */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="yourusername"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      disabled={saving}
                      className="pr-10"
                      minLength={3}
                      maxLength={50}
                    />
                    {usernameChecking && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!usernameChecking && usernameAvailable === true && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {!usernameChecking && usernameAvailable === false && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive text-sm">
                        ✕
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only lowercase letters, numbers, and underscores. Minimum 3
                    characters.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={
                      saving ||
                      uploadingPhoto ||
                      usernameChecking ||
                      usernameAvailable === false ||
                      (!profilePhotoFile && username === profile?.username)
                    }
                    className="rounded-full"
                  >
                    {saving || uploadingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {uploadingPhoto ? "Uploading..." : "Saving..."}
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === "theme" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                    Theme Settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose how the app looks to you
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="mb-4">Appearance</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                        theme === "light"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full flex items-center justify-center">
                        <Sun className="h-8 w-8 text-amber-500" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Light</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Bright and clean
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                        theme === "dark"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full flex items-center justify-center">
                        <Moon className="h-8 w-8 text-blue-400" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Dark</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Easy on the eyes
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setTheme("system")}
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                        theme === "system"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full  flex items-center justify-center">
                        <Monitor className="h-8 w-8 text-foreground" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium">System</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Follows device
                        </div>
                      </div>
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {theme === "system"
                      ? "Theme will automatically switch based on your device settings."
                      : theme === "light"
                        ? "Using light theme."
                        : "Using dark theme."}
                  </p>
                </div>
              </div>
            )}

            {/* Base Avatar Tab */}
            {activeTab === "base-avatar" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                    Base Avatar
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Customize your AI-generated avatar
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md">
                    We're working on this feature. Soon you'll be able to
                    regenerate and customize your base avatar with more options.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
