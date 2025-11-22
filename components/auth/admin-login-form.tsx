"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createServerClient } from "@/lib/supabase/client";
import { Loader } from "lucide-react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createServerClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError("Invalid credentials. Please check your email and password.");
        setLoading(false);
        return;
      }

      // Verify that this user is a brand (exists in brands table)
      const { data: brandData, error: brandError } = await supabase
        .from("brands")
        .select("id, brand_name, is_active")
        .eq("id", data.user.id)
        .single();

      if (brandError || !brandData) {
        // User is not a brand, sign them out
        await supabase.auth.signOut();
        setError("You don't have permissions to access the admin panel.");
        setLoading(false);
        return;
      }

      if (!brandData.is_active) {
        await supabase.auth.signOut();
        setError("Your brand account is deactivated. Please contact support.");
        setLoading(false);
        return;
      }

      // Success - redirect to admin home
      router.push("/admin/home");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="w-sm p-0">
      <div className="mb-4 text-center">
        <h1 className="text-5xl tracking-tighter font-bold text-foreground mb-2">
          Brands
        </h1>
        <p className="text-muted-foreground text-lg">
          Access for brand partners only
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="w-full px-3 py-2 rounded-md bg-destructive/10">
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="text-base px-4 py-2 w-full rounded-full bg-muted border border-border focus:outline-none "
            />
          </div>
          <div className="space-y-2">
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="text-base px-4 py-2 w-full rounded-full bg-muted border border-border focus:outline-none "
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer bg-primary text-white rounded-full h-10 flex items-center justify-center text-base font-semibold "
            disabled={loading}
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground font-medium">
          Contact sales to register your brand.
        </div>
      </div>
    </div>
  );
}
