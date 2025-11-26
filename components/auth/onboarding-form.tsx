"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { createServerClient } from "@/lib/supabase/client";
import {
  Loader2,
  CheckCircle2,
  Upload,
  X,
  Image as ImageIcon,
  Check,
  Loader,
} from "lucide-react";
import { Dropzone } from "@/components/ui/dropzone";
import type {
  Gender,
  BodyType,
  OnboardingFormData,
  AvatarHistory,
} from "@/lib/types/user";
import Image from "next/image";

type OnboardingStep = "username" | "profile" | "photos" | "preview";

export function OnboardingForm() {
  const [step, setStep] = useState<OnboardingStep>("username");
  const [formData, setFormData] = useState<OnboardingFormData>({
    username: "",
    age: 18,
    gender: "other",
    height: 170,
    weight: 70,
    body_type: "average",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  // Step 2: Photos
  const [fullBodyPhoto, setFullBodyPhoto] = useState<File | null>(null);
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [fullBodyPreview, setFullBodyPreview] = useState<string | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Step 3: Avatar generation
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [regenerationsLeft, setRegenerationsLeft] = useState(3);
  const [avatarHistory, setAvatarHistory] = useState<AvatarHistory[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const router = useRouter();
  const supabase = createServerClient();

  const loadAvatarHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: history, error } = await supabase
        .from("avatar_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading avatar history:", error);
        return;
      }

      if (history && history.length > 0) {
        setAvatarHistory(history);

        // Buscar el avatar seleccionado
        const selected = history.find((a: any) => a.is_selected);
        if (selected) {
          setSelectedAvatarId(selected.id);
          setGeneratedAvatar(selected.avatar_url);
        } else {
          // Si no hay ninguno seleccionado, usar el más reciente
          const latest = history[history.length - 1];
          setSelectedAvatarId(latest.id);
          setGeneratedAvatar(latest.avatar_url);
        }
      }

      // Cargar las regeneraciones restantes
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("avatar_regenerations_left")
        .eq("id", user.id)
        .single();

      if (profile) {
        setRegenerationsLeft(profile.avatar_regenerations_left);
      }
    } catch (err) {
      console.error("Error loading avatar history:", err);
    }
  };

  // Cargar historial de avatares al montar el componente si ya existen
  React.useEffect(() => {
    if (!isInitialized) {
      loadAvatarHistory();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Scroll hacia arriba cada vez que cambie el paso
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      // Obtener el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUsernameAvailable(null);
        setUsernameChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("username, id")
        .eq("username", username)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // Si no hay datos o si el username pertenece al usuario actual, está disponible
      setUsernameAvailable(!data || data.id === user.id);
    } catch (err) {
      console.error("Error checking username:", err);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setFormData({ ...formData, username: sanitized });

    if (sanitized.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(sanitized);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validaciones del username
    if (formData.username.length < 3) {
      setError("The username must be at least 3 characters");
      setLoading(false);
      return;
    }

    if (usernameAvailable === false) {
      setError("This username is already in use");
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Could not get user information");
        setLoading(false);
        return;
      }

      // Verificar si el perfil ya existe
      const { data: existingProfile, error: checkError } = await supabase
        .from("user_profiles")
        .select("id, username")
        .eq("id", user.id)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingProfile) {
        // Si el perfil ya existe, actualizar solo el username si es diferente
        if (existingProfile.username !== formData.username) {
          const { error: updateError } = await supabase
            .from("user_profiles")
            .update({ username: formData.username })
            .eq("id", user.id);

          if (updateError) {
            if (updateError.code === "23505") {
              setError("This username is already in use");
            } else {
              setError(`Error updating profile: ${updateError.message}`);
            }
            setLoading(false);
            return;
          }
        }
      } else {
        // Si el perfil no existe, crearlo
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            id: user.id,
            username: formData.username,
            age: 18,
            gender: "other",
            height: 170,
            weight: 70,
            body_type: "average",
            onboarding_completed: false,
          });

        if (insertError) {
          if (insertError.code === "23505") {
            setError("This username is already in use");
          } else {
            setError(`Error creating profile: ${insertError.message}`);
          }
          setLoading(false);
          return;
        }
      }

      // Pasar al siguiente paso
      setStep("profile");
    } catch (err) {
      console.error("Error onboarding:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validaciones de características físicas
    if (formData.age < 13 || formData.age > 120) {
      setError("You must be between 13 and 120 years old");
      setLoading(false);
      return;
    }

    if (formData.height < 50 || formData.height > 300) {
      setError("Please enter a valid height (50-300 cm)");
      setLoading(false);
      return;
    }

    if (formData.weight < 20 || formData.weight > 500) {
      setError("Please enter a valid weight (20-500 kg)");
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No se pudo obtener la información del usuario");
        setLoading(false);
        return;
      }

      // Actualizar el perfil del usuario con las características físicas
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          body_type: formData.body_type,
        })
        .eq("id", user.id);

      if (updateError) {
        setError(`Error al actualizar el perfil: ${updateError.message}`);
        setLoading(false);
        return;
      }

      // Verificar si el usuario ya tiene avatares generados y no le quedan regeneraciones
      // Esto ocurre cuando el usuario se desloguea y vuelve a entrar después de usar todas las regeneraciones
      const { data: existingAvatars } = await supabase
        .from("avatar_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("avatar_regenerations_left")
        .eq("id", user.id)
        .single();

      // Si ya tiene avatares y no le quedan regeneraciones, saltar al paso de preview
      if (
        existingAvatars &&
        existingAvatars.length > 0 &&
        profile &&
        profile.avatar_regenerations_left <= 0
      ) {
        setAvatarHistory(existingAvatars);
        setRegenerationsLeft(0);

        // Seleccionar el avatar que ya estaba seleccionado o el más reciente
        const selected = existingAvatars.find((a: any) => a.is_selected);
        if (selected) {
          setSelectedAvatarId(selected.id);
          setGeneratedAvatar(selected.avatar_url);
        } else {
          const latest = existingAvatars[existingAvatars.length - 1];
          setSelectedAvatarId(latest.id);
          setGeneratedAvatar(latest.avatar_url);
        }

        setStep("preview");
      } else {
        // Pasar al paso de fotos normalmente
        setStep("photos");
      }
    } catch (err) {
      console.error("Error en onboarding:", err);
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (file: File, type: "full-body" | "face") => {
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "full-body") {
        setFullBodyPhoto(file);
        setFullBodyPreview(reader.result as string);
      } else {
        setFacePhoto(file);
        setFacePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (type: "full-body" | "face") => {
    if (type === "full-body") {
      setFullBodyPhoto(null);
      setFullBodyPreview(null);
    } else {
      setFacePhoto(null);
      setFacePreview(null);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!fullBodyPhoto || !facePhoto) {
      setError("Por favor sube ambas fotos");
      return;
    }

    setGeneratingAvatar(true);
    setError("");

    try {
      // Convertir las imágenes a base64
      const fullBodyBase64 = await fileToBase64(fullBodyPhoto);
      const faceBase64 = await fileToBase64(facePhoto);

      console.log("Sending request to generate avatar...");

      // Llamar a la API para generar el avatar
      const response = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullBodyImage: fullBodyBase64,
          faceImage: faceBase64,
          additionalNotes: additionalNotes || undefined,
          profileData: formData,
        }),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response content-type:",
        response.headers.get("content-type")
      );

      // Obtener el texto de la respuesta primero
      const responseText = await response.text();
      console.log("Response text:", responseText);

      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(
          `El servidor no devolvió una respuesta válida. Respuesta: ${responseText.substring(0, 200)}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Error al generar el avatar");
      }

      setGeneratedAvatar(data.avatarUrl);
      setRegenerationsLeft(data.regenerationsLeft);
      setAvatarHistory(data.avatarHistory || []);

      // Seleccionar automáticamente el avatar recién generado
      if (data.avatarHistory && data.avatarHistory.length > 0) {
        const latestAvatar = data.avatarHistory[data.avatarHistory.length - 1];
        setSelectedAvatarId(latestAvatar.id);
      }

      setStep("preview");
    } catch (err) {
      console.error("Error generating avatar:", err);
      setError(
        err instanceof Error ? err.message : "Error al generar el avatar"
      );
    } finally {
      setGeneratingAvatar(false);
    }
  };

  const handleRegenerateAvatar = () => {
    if (regenerationsLeft <= 0) {
      setError("Has alcanzado el límite de regeneraciones");
      return;
    }

    // Limpiar las fotos anteriores para que el usuario suba nuevas
    setFullBodyPhoto(null);
    setFacePhoto(null);
    setFullBodyPreview(null);
    setFacePreview(null);
    setAdditionalNotes("");

    // Volver al paso de fotos para subir nuevas fotos
    setStep("photos");
    setError("");
  };

  const handleSelectAvatar = async (avatarId: string, avatarUrl: string) => {
    try {
      // Desmarcar todos los avatares
      const { error: unselectError } = await supabase
        .from("avatar_generations")
        .update({ is_selected: false })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "");

      if (unselectError) {
        console.error("Error unselecting avatars:", unselectError);
        return;
      }

      // Marcar el avatar seleccionado
      const { error: selectError } = await supabase
        .from("avatar_generations")
        .update({ is_selected: true })
        .eq("id", avatarId);

      if (selectError) {
        console.error("Error selecting avatar:", selectError);
        return;
      }

      setSelectedAvatarId(avatarId);
      setGeneratedAvatar(avatarUrl);
    } catch (err) {
      console.error("Error selecting avatar:", err);
      setError("Error al seleccionar el avatar");
    }
  };

  const handleCompleteSetup = async () => {
    if (!generatedAvatar) {
      setError("Debes generar un avatar primero");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Obtener el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No se pudo obtener la información del usuario");
        setLoading(false);
        return;
      }

      // Solo subir fotos si el usuario tiene fotos nuevas
      // Si el usuario ya tenía avatares previos y volvió al onboarding, las fotos ya están en el storage
      if (fullBodyPhoto && facePhoto) {
        // Subir la foto del cuerpo completo con nombre fijo para poder encontrarla después
        const bodyFileName = `${user.id}/body.${fullBodyPhoto.name.split(".").pop()}`;
        const { error: bodyUploadError } = await supabase.storage
          .from("user-photos")
          .upload(bodyFileName, fullBodyPhoto, {
            cacheControl: "3600",
            upsert: true, // Reemplazar si ya existe
          });

        if (bodyUploadError) {
          console.error("Error uploading body photo:", bodyUploadError);
          throw new Error("Error al subir la foto del cuerpo");
        }

        // Subir la foto del rostro con nombre fijo para poder encontrarla después
        const faceFileName = `${user.id}/face.${facePhoto.name.split(".").pop()}`;
        const { error: faceUploadError } = await supabase.storage
          .from("user-photos")
          .upload(faceFileName, facePhoto, {
            cacheControl: "3600",
            upsert: true, // Reemplazar si ya existe
          });

        if (faceUploadError) {
          console.error("Error uploading face photo:", faceUploadError);
          // Intentar eliminar la foto del cuerpo si falló la del rostro
          await supabase.storage.from("user-photos").remove([bodyFileName]);
          throw new Error("Error al subir la foto del rostro");
        }
      }

      // Actualizar el perfil solo con el avatar y marcar onboarding como completado
      // También asignar 5 try-ons iniciales al usuario
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          onboarding_completed: true,
          avatar_url: generatedAvatar,
          try_ons_left: 5,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }

      // Redirigir al home
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Error completing setup:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al completar la configuración"
      );
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          // Crear un canvas para redimensionar la imagen
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Redimensionar a un máximo de 1024x1024 manteniendo el aspect ratio
          const maxSize = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Dibujar la imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a base64 con compresión
          const base64 = canvas.toDataURL("image/jpeg", 0.85);
          // Remover el prefijo data:image/...;base64,
          const base64Data = base64.split(",")[1];
          resolve(base64Data);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  // Renderizar según el paso actual
  if (step === "photos") {
    return (
      <div className="w-full lg:max-w-4xl mx-auto lg:p-6 p-2">
        <div className="mb-8 text-center">
          <h1 className="text-4xl lg:text-5xl tracking-tighter font-bold text-foreground mb-2">
            Upload Your Photos
          </h1>
          <p className="text-muted-foreground lg:text-lg text-base">
            The AI will create your avatar based 100% on the photos you upload.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Full Body Photo */}
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullbody">
                Full Body Photo <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Upload a photo of your full body standing straight, arms at your
                sides, looking at the camera.
              </p>
              <Dropzone
                type="body"
                onFileSelect={(file) => handlePhotoChange(file, "full-body")}
                onFileRemove={() => removePhoto("full-body")}
                preview={fullBodyPreview}
                placeholder="Click or drag"
                description="PNG, JPG, WEBP hasta 10MB"
                className="aspect-square flex flex-col justify-center items-center"
              />
            </div>

            {/* Face Photo */}
            <div className="space-y-2">
              <Label htmlFor="face">
                Face Photo <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Ideally taken at the same time as your full-body photo to avoid
                confusing the AI with different appearances.
              </p>
              <Dropzone
                type="face"
                onFileSelect={(file) => handlePhotoChange(file, "face")}
                onFileRemove={() => removePhoto("face")}
                preview={facePreview}
                placeholder="Click or drag"
                description="PNG, JPG, WEBP hasta 10MB"
                className="aspect-square flex flex-col justify-center items-center"
              />
            </div>
          </div>
          {/* Additional Notes */}
          {/* <div className="space-y-2">
            <Label htmlFor="notes">
              Additional Notes{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Any specific details about your body that you'd like us to consider..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div> */}

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setStep("profile")}
              className="flex-1 rounded-full cursor-pointer"
            >
              Back
            </Button>
            <Button
              onClick={handleGenerateAvatar}
              disabled={!fullBodyPhoto || !facePhoto || generatingAvatar}
              className="flex-1 rounded-full cursor-pointer font-medium text-white"
            >
              {generatingAvatar ? (
                <Loader className="h-4 w-4 animate-spin text-white" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "preview") {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter text-foreground mb-2">
            Your Avatar is Ready
          </h1>
          <p className="text-muted-foreground">
            {regenerationsLeft > 0
              ? `You have ${regenerationsLeft} regeneration${
                  regenerationsLeft > 1 ? "s" : ""
                } left`
              : "You've used all regenerations"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedAvatar && (
          <div className="mb-6 rounded-3xl border border-border w-full overflow-hidden aspect-square">
            <img
              src={generatedAvatar}
              alt="Generated avatar"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Avatar History Thumbnails */}
        {avatarHistory.length > 1 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Select from your generated avatars:
            </p>
            <div className="grid grid-cols-3  gap-3">
              {avatarHistory.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() =>
                    handleSelectAvatar(avatar.id, avatar.avatar_url)
                  }
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedAvatarId === avatar.id
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={avatar.avatar_url}
                    alt={`Avatar ${avatar.generation_number}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatarId === avatar.id && (
                    <div className="absolute top-1 right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                    #{avatar.generation_number}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          <Button
            variant="outline"
            onClick={handleRegenerateAvatar}
            disabled={regenerationsLeft <= 0 || generatingAvatar}
            className="flex-1 rounded-full"
          >
            {generatingAvatar && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Re-generate with new photos ({regenerationsLeft} left)
          </Button>
          <Button
            onClick={handleCompleteSetup}
            disabled={loading || generatingAvatar}
            className="flex-1 rounded-full cursor-pointer text-white font-medium"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Continue"}
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: Username
  if (step === "username") {
    return (
      <div className="w-full lg:max-w-md mx-auto lg:p-6 p-2">
        <div className="mb-4 text-center">
          <h1 className="text-4xl lg:text-5xl tracking-tighter font-bold text-foreground mb-2">
            Welcome
          </h1>
          <p className="text-muted-foreground lg:text-lg text-base">
            Let's start by choosing your username
          </p>
        </div>

        <form onSubmit={handleUsernameSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Username */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="username"
                type="text"
                placeholder="leomessi"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                required
                disabled={loading}
                className="text-lg px-4 py-2 w-full rounded-full bg-muted border border-border focus:outline-none "
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
            <p className="text-xs text-muted-foreground ml-4">
              Only lowercase letters, numbers, and underscores.
              <br />
              Minimum 3 characters.
            </p>
          </div>
          <div className="w-full px-4">
            <Button
              type="submit"
              className="w-full rounded-full cursor-pointer bg-primary text-white"
              disabled={
                loading || usernameChecking || usernameAvailable === false
              }
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin text-white" />
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: Profile form (características físicas)
  return (
    <div className="w-full lg:max-w-3xl mx-auto lg:p-6 p-2">
      <div className="mb-8 text-center">
        <h1 className="text-4xl lg:text-5xl tracking-tighter font-bold text-foreground mb-2">
          Physical Characteristics
        </h1>
        <p className="text-muted-foreground lg:text-lg text-base">
          Tell us about your physical characteristics to create your
          personalized avatar
        </p>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age" className="">
              Age <span className="text-destructive">*</span>
            </Label>
            <input
              id="age"
              type="number"
              placeholder="18"
              value={formData.age || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  age: value === "" ? 0 : parseInt(value) || 0,
                });
              }}
              onBlur={(e) => {
                if (e.target.value === "" || parseInt(e.target.value) < 13) {
                  setFormData({
                    ...formData,
                    age: 18,
                  });
                }
              }}
              required
              disabled={loading}
              className="text-lg px-4 py-2 w-full rounded-full bg-muted border border-border focus:outline-none"
              min={13}
              max={120}
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">
              Gender <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value: Gender) =>
                setFormData({ ...formData, gender: value })
              }
              disabled={loading}
            >
              <SelectTrigger
                id="gender"
                className="text-lg px-4 h-[46px] w-full rounded-full bg-muted border border-border focus:outline-none focus:ring-0 ring-0 outline-0"
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="p-0.5 rounded-3xl w-full focus:outline-none focus:ring-0 bg-background">
                <SelectItem
                  value="male"
                  className="text-base px-4 py-2 rounded-2xl"
                >
                  Male
                </SelectItem>
                <SelectItem
                  value="female"
                  className="text-base px-4 py-2 rounded-2xl"
                >
                  Female
                </SelectItem>
                <SelectItem
                  value="other"
                  className="text-base px-4 py-2 rounded-2xl"
                >
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">
              Height (cm) <span className="text-destructive">*</span>
            </Label>
            <input
              id="height"
              type="number"
              placeholder="170"
              value={formData.height || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  height: value === "" ? 0 : parseFloat(value) || 0,
                });
              }}
              onBlur={(e) => {
                if (e.target.value === "" || parseFloat(e.target.value) < 50) {
                  setFormData({
                    ...formData,
                    height: 170,
                  });
                }
              }}
              required
              disabled={loading}
              className="text-lg px-4 py-2 w-full rounded-full bg-muted border border-border focus:outline-none"
              min={50}
              max={300}
              step={0.1}
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">
              Weight (kg) <span className="text-destructive">*</span>
            </Label>
            <input
              id="weight"
              type="number"
              placeholder="70"
              value={formData.weight || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  weight: value === "" ? 0 : parseFloat(value) || 0,
                });
              }}
              onBlur={(e) => {
                if (e.target.value === "" || parseFloat(e.target.value) < 20) {
                  setFormData({
                    ...formData,
                    weight: 70,
                  });
                }
              }}
              required
              disabled={loading}
              className="text-lg px-4 py-2 w-full rounded-full bg-muted border border-border focus:outline-none"
              min={20}
              max={500}
              step={0.1}
            />
          </div>
        </div>

        {/* Body Type */}
        <div className="space-y-4">
          <Label htmlFor="body_type">
            Body Type <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Select the body type that best represents you
          </p>
          <div className="grid grid-cols-5 lg:gap-4 gap-1">
            {[
              { value: "underweight", image: "/weights/1.png", label: "1" },
              { value: "slim", image: "/weights/2.png", label: "2" },
              { value: "average", image: "/weights/3.png", label: "3" },
              { value: "athletic", image: "/weights/4.png", label: "4" },
              { value: "overweight", image: "/weights/5.png", label: "5" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    body_type: option.value as BodyType,
                  })
                }
                disabled={loading}
                className={`relative p-2 cursor-pointer lg:rounded-3xl rounded-2xl bg-white border transition-all ${
                  formData.body_type === option.value
                    ? "border-primary border-2"
                    : "border-border"
                }`}
              >
                <Image
                  src={option.image}
                  alt={`Body type ${option.label}`}
                  width={80}
                  height={120}
                  className="w-full h-auto object-cover rounded"
                />
                {formData.body_type === option.value && (
                  <div className="absolute -top-2 -right-2 lg:w-6 lg:h-6 w-4.5 h-4.5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    <Check className=" lg:w-4  lg:h-4 w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("username")}
            className="flex-1 rounded-full cursor-pointer"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 rounded-full cursor-pointer font-medium text-white"
            disabled={loading}
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
