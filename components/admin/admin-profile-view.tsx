"use client";

import { useState } from "react";
import { createServerClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Upload, Save, User as UserIcon, CheckCircle, XCircle } from "lucide-react";

interface Brand {
  id: string;
  brand_name: string;
  brand_username: string;
  email: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  is_active: boolean;
}

interface AdminProfileViewProps {
  brand: Brand | null;
}

export function AdminProfileView({ brand }: AdminProfileViewProps) {
  const [formData, setFormData] = useState({
    brand_name: brand?.brand_name || "",
    brand_username: brand?.brand_username || "",
    description: brand?.description || "",
    website_url: brand?.website_url || "",
    logo_url: brand?.logo_url || "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const supabase = createServerClient();
  const router = useRouter();

  if (!brand) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground tracking-tight">No se encontró la información de la marca</p>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Por favor selecciona una imagen válida" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "La imagen debe ser menor a 5MB" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${brand.id}-${Date.now()}.${fileExt}`;
      const filePath = `brand-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      setFormData({
        ...formData,
        logo_url: publicUrl,
      });

      setMessage({ type: "success", text: "Logo subido correctamente" });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setMessage({ type: "error", text: "Error al subir el logo" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("brands")
        .update({
          brand_name: formData.brand_name,
          brand_username: formData.brand_username,
          description: formData.description,
          website_url: formData.website_url,
          logo_url: formData.logo_url,
        })
        .eq("id", brand.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Perfil actualizado correctamente" });
      router.refresh();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Error al actualizar el perfil" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tighter">Perfil de Marca</h1>
        <p className="text-muted-foreground mt-2 tracking-tight">
          Gestiona la información de tu marca
        </p>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium tracking-tight">{message.text}</p>
        </div>
      )}

      {/* Logo de la marca */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold tracking-tight mb-4">Logo de la Marca</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-neutral-100 border border-border flex items-center justify-center flex-shrink-0">
            {formData.logo_url ? (
              <img
                src={formData.logo_url}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <label
              htmlFor="logo-upload"
              className={`cursor-pointer inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-foreground px-6 py-3 rounded-full transition-colors font-medium tracking-tight ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Subiendo..." : "Cambiar Logo"}
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-3 tracking-tight">
              Sube una imagen cuadrada (recomendado: 500x500px, máx. 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Información de la marca */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold tracking-tight mb-6">Información de la Marca</h2>
        <div className="space-y-5">
          <div>
            <label htmlFor="brand_name" className="block text-sm font-medium tracking-tight mb-2">
              Nombre de la Marca
            </label>
            <input
              id="brand_name"
              name="brand_name"
              type="text"
              value={formData.brand_name}
              onChange={handleInputChange}
              placeholder="Ej: Mi Marca"
              className="w-full px-4 py-3 rounded-full bg-neutral-50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 tracking-tight"
            />
          </div>

          <div>
            <label htmlFor="brand_username" className="block text-sm font-medium tracking-tight mb-2">
              Nombre de Usuario
            </label>
            <input
              id="brand_username"
              name="brand_username"
              type="text"
              value={formData.brand_username}
              onChange={handleInputChange}
              placeholder="Ej: mimarca"
              className="w-full px-4 py-3 rounded-full bg-neutral-50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 tracking-tight"
            />
            <p className="text-xs text-muted-foreground mt-2 tracking-tight">
              Este nombre aparecerá en la URL de tu perfil
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium tracking-tight mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={brand.email}
              disabled
              className="w-full px-4 py-3 rounded-full bg-neutral-100 border border-border text-muted-foreground cursor-not-allowed tracking-tight"
            />
            <p className="text-xs text-muted-foreground mt-2 tracking-tight">
              El email no se puede modificar
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium tracking-tight mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe tu marca..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-neutral-50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 tracking-tight resize-none"
            />
          </div>

          <div>
            <label htmlFor="website_url" className="block text-sm font-medium tracking-tight mb-2">
              Sitio Web
            </label>
            <input
              id="website_url"
              name="website_url"
              type="url"
              value={formData.website_url}
              onChange={handleInputChange}
              placeholder="https://www.tumarca.com"
              className="w-full px-4 py-3 rounded-full bg-neutral-50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 tracking-tight"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full bg-primary text-white flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium tracking-tight transition-all ${
              saving ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* Estado de la cuenta */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold tracking-tight mb-4">Estado de la Cuenta</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium tracking-tight">Estado</p>
            <p className="text-sm text-muted-foreground tracking-tight mt-1">
              {brand.is_active ? "Tu cuenta está activa" : "Tu cuenta está inactiva"}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium tracking-tight ${
              brand.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {brand.is_active ? "Activa" : "Inactiva"}
          </div>
        </div>
      </div>
    </div>
  );
}
