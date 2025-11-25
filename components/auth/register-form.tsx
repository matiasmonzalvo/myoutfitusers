"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createServerClient } from "@/lib/supabase/client";
import { Loader, Loader2, Eye, EyeOff } from "lucide-react";
import { AuthErrorHandler } from "./auth-error-handler";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [emailValidated, setEmailValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const supabase = createServerClient();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    setEmailValidated(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for the confirmation link");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(
        "Ocurrió un error inesperado durante el inicio de sesión con Google"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setEmailValidated(false);
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="w-full p-0">
      <div className="mb-4 text-center">
        <h1 className="text-5xl tracking-tighter font-bold text-foreground mb-2">
          Sign up
        </h1>
        <p className="text-muted-foreground text-lg">Create your account</p>
      </div>
      <div>
        <form
          onSubmit={emailValidated ? handleSubmit : handleContinue}
          className="space-y-4"
        >
          <AuthErrorHandler />

          {error && (
            <div className="w-full px-3 py-2 rounded-md bg-destructive/10">
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {message && (
            <div className="w-full px-3 py-2 rounded-full bg-green-600/10">
              <span className="text-sm text-green-600">{message}</span>
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
              disabled={loading || googleLoading}
              className="text-base px-4 py-2 w-full rounded-full bg-muted border border-border focus:outline-none "
            />
          </div>

          {emailValidated && (
            <>
              <div className=" relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || googleLoading}
                  className="text-base px-4 py-2 pr-12 w-full rounded-full bg-muted border border-border focus:outline-none "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading || googleLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || googleLoading}
                  className="text-base px-4 py-2 pr-12 w-full rounded-full bg-muted border border-border focus:outline-none "
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading || googleLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full cursor-pointer bg-primary text-white rounded-full h-10 flex items-center justify-center text-base font-semibold "
            disabled={loading || googleLoading}
          >
            {loading ? (
              <Loader className="mr-2 h-4 w-4 animate-spin text-white" />
            ) : emailValidated ? (
              "Create account"
            ) : (
              "Continue"
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground font-medium">
          {"Already have an account? "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full relative cursor-pointer h-10 rounded-full"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
        >
          {googleLoading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin text-foreground" />
          ) : (
            <>
              <svg
                aria-hidden="true"
                role="graphics-symbol"
                viewBox="0 0 20 20"
                className="mr-2 w-5 h-5"
              >
                <g>
                  <path
                    d="M19.9996 10.2297C19.9996 9.54995 19.9434 8.8665 19.8234 8.19775H10.2002V12.0486H15.711C15.4823 13.2905 14.7475 14.3892 13.6716 15.0873V17.586H16.9593C18.89 15.8443 19.9996 13.2722 19.9996 10.2297Z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M10.2002 20.0003C12.9518 20.0003 15.2723 19.1147 16.963 17.5862L13.6753 15.0875C12.7606 15.6975 11.5797 16.0429 10.2039 16.0429C7.54224 16.0429 5.28544 14.2828 4.4757 11.9165H1.08301V14.4923C2.81497 17.8691 6.34261 20.0003 10.2002 20.0003Z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M4.47227 11.9163C4.04491 10.6743 4.04491 9.32947 4.47227 8.0875V5.51172H1.08333C-0.363715 8.33737 -0.363715 11.6664 1.08333 14.4921L4.47227 11.9163Z"
                    fill="#FBBC04"
                  ></path>
                  <path
                    d="M10.2002 3.95756C11.6547 3.93552 13.0605 4.47198 14.1139 5.45674L17.0268 2.60169C15.1824 0.904099 12.7344 -0.0292099 10.2002 0.000185607C6.34261 0.000185607 2.81497 2.13136 1.08301 5.51185L4.47195 8.08764C5.27795 5.71762 7.53849 3.95756 10.2002 3.95756Z"
                    fill="#EA4335"
                  ></path>
                </g>
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
