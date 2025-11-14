"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createServerClient } from "@/lib/supabase/client";
import { LineSpinner } from "ldrs/react";

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
        setError("Credenciales inválidas. Verifica tu email y contraseña.");
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
        setError("No tienes permisos para acceder al panel de administración.");
        setLoading(false);
        return;
      }

      if (!brandData.is_active) {
        await supabase.auth.signOut();
        setError(
          "Tu cuenta de marca está desactivada. Contacta al administrador."
        );
        setLoading(false);
        return;
      }

      // Success - redirect to admin home
      router.push("/admin/home");
      router.refresh();
    } catch (err) {
      setError("Ocurrió un error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">Acceso exclusivo para marcas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="w-full px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20">
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email de la Marca</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@marca.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="text-base"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <LineSpinner
              size="20"
              stroke="3"
              speed="1.1"
              color="var(--background)"
            />
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>¿No tienes acceso?</p>
        <p className="mt-1">
          Contacta al administrador para registrar tu marca.
        </p>
      </div>
    </div>
  );
}
