# 📚 Ejemplos de Uso - Sistema de Onboarding

## 🎯 Casos de Uso Comunes

### 1. Mostrar información del usuario en el Header

```typescript
// components/layout/header.tsx
"use client";

import { useUserProfile } from "@/hooks/use-user-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <header>
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback>
            {profile?.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>@{profile?.username}</span>
      </div>
    </header>
  );
}
```

---

### 2. Verificar perfil en una página del servidor

```typescript
// app/dashboard/page.tsx
import { getUserProfile } from "@/lib/utils/get-user-profile";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { user, profile, hasCompletedOnboarding } = await getUserProfile();

  // Si no está autenticado, redirigir a login
  if (!user) {
    redirect("/login");
  }

  // Si no ha completado onboarding, redirigir
  if (!hasCompletedOnboarding) {
    redirect("/onboarding");
  }

  return (
    <div>
      <h1>Dashboard de {profile?.username}</h1>
      <p>Edad: {profile?.age} años</p>
      <p>Tipo de cuerpo: {profile?.body_type}</p>
    </div>
  );
}
```

---

### 3. Formulario de edición de perfil

```typescript
// components/profile/edit-profile-form.tsx
"use client";

import { useState } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { createServerClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export function EditProfileForm() {
  const { profile } = useUserProfile();
  const supabase = createServerClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: profile?.age || 18,
    height: profile?.height || 170,
    weight: profile?.weight || 70,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          age: formData.age,
          height: formData.height,
          weight: formData.weight,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="number"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
        placeholder="Age"
      />
      <Input
        type="number"
        value={formData.height}
        onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
        placeholder="Height (cm)"
      />
      <Input
        type="number"
        value={formData.weight}
        onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
        placeholder="Weight (kg)"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
```

---

### 4. Verificar tipo de cuerpo para recomendaciones

```typescript
// lib/utils/get-clothing-recommendations.ts
import { getUserProfile } from "@/lib/utils/get-user-profile";

export async function getClothingRecommendations() {
  const { profile } = await getUserProfile();

  if (!profile) return [];

  // Lógica de recomendaciones basada en body_type
  switch (profile.body_type) {
    case "slim":
      return ["Fitted shirts", "Slim-fit jeans", "Layered clothing"];
    case "athletic":
      return ["Tailored fit shirts", "Athletic fit pants", "Performance wear"];
    case "average":
      return ["Regular fit clothing", "Versatile pieces", "Classic styles"];
    // ... más casos
    default:
      return [];
  }
}
```

---

### 5. API Route para obtener perfil

```typescript
// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/utils/get-user-profile";

export async function GET() {
  try {
    const { user, profile, hasCompletedOnboarding } = await getUserProfile();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!hasCompletedOnboarding) {
      return NextResponse.json(
        { error: "Onboarding not completed" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      profile,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

### 6. Calcular IMC (BMI) del usuario

```typescript
// lib/utils/calculate-bmi.ts
import type { UserProfile } from "@/lib/types/user";

export function calculateBMI(profile: UserProfile): number {
  // BMI = peso (kg) / (altura (m))^2
  const heightInMeters = profile.height / 100;
  const bmi = profile.weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10; // Redondear a 1 decimal
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// Uso:
import { useUserProfile } from "@/hooks/use-user-profile";
import { calculateBMI, getBMICategory } from "@/lib/utils/calculate-bmi";

export function BMIDisplay() {
  const { profile } = useUserProfile();

  if (!profile) return null;

  const bmi = calculateBMI(profile);
  const category = getBMICategory(bmi);

  return (
    <div>
      <p>Your BMI: {bmi}</p>
      <p>Category: {category}</p>
    </div>
  );
}
```

---

### 7. Proteger una API route con verificación de perfil

```typescript
// app/api/avatar/generate/route.ts
import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/utils/get-user-profile";

export async function POST(request: Request) {
  const { user, profile, hasCompletedOnboarding } = await getUserProfile();

  // Verificar autenticación
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Verificar onboarding
  if (!hasCompletedOnboarding || !profile) {
    return NextResponse.json(
      { error: "Please complete your profile first" },
      { status: 403 }
    );
  }

  try {
    // Aquí iría la lógica para generar el avatar con IA
    const avatarData = {
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      body_type: profile.body_type,
    };

    // Llamar a API de IA para generar avatar
    // const avatarUrl = await generateAvatar(avatarData);

    return NextResponse.json({
      message: "Avatar generation started",
      profileData: avatarData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate avatar" },
      { status: 500 }
    );
  }
}
```

---

### 8. Mostrar estadísticas del usuario

```typescript
// components/profile/profile-stats.tsx
"use client";

import { useUserProfile } from "@/hooks/use-user-profile";
import { calculateBMI, getBMICategory } from "@/lib/utils/calculate-bmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileStats() {
  const { profile, loading } = useUserProfile();

  if (loading || !profile) return null;

  const bmi = calculateBMI(profile);
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>BMI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{bmi}</p>
          <p className="text-sm text-muted-foreground">{bmiCategory}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Body Type</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl capitalize">{profile.body_type}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Physical Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{profile.height} cm</p>
          <p>{profile.weight} kg</p>
          <p>{profile.age} years old</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 9. Guard Component para proteger rutas

```typescript
// components/auth/onboarding-guard.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Loader2 } from "lucide-react";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { loading, isAuthenticated, hasCompletedOnboarding } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!hasCompletedOnboarding) {
        router.push("/onboarding");
      }
    }
  }, [loading, isAuthenticated, hasCompletedOnboarding, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !hasCompletedOnboarding) {
    return null;
  }

  return <>{children}</>;
}

// Uso:
export function ProtectedPage() {
  return (
    <OnboardingGuard>
      <div>
        <h1>This page requires authentication and completed onboarding</h1>
      </div>
    </OnboardingGuard>
  );
}
```

---

### 10. Actualizar avatar_url después de generación

```typescript
// lib/actions/update-avatar.ts
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAvatarUrl(avatarUrl: string) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

// Uso en un componente:
import { updateAvatarUrl } from "@/lib/actions/update-avatar";

export function AvatarGenerator() {
  const handleGenerateAvatar = async () => {
    // ... generar avatar con IA
    const avatarUrl = "https://example.com/avatar.png";

    const result = await updateAvatarUrl(avatarUrl);

    if (result.error) {
      console.error("Error updating avatar:", result.error);
    } else {
      console.log("Avatar updated successfully!");
    }
  };

  return <button onClick={handleGenerateAvatar}>Generate Avatar</button>;
}
```

---

## 🎯 Tips y Best Practices

### 1. Siempre verificar loading state

```typescript
const { profile, loading } = useUserProfile();
if (loading) return <Skeleton />;
if (!profile) return <div>No profile found</div>;
```

### 2. Usar el middleware para protección global

No necesitas verificar onboarding en cada página, el middleware lo hace automáticamente.

### 3. Actualizar el cache después de cambios

```typescript
import { revalidatePath } from "next/cache";
// Después de actualizar el perfil
revalidatePath("/profile");
```

### 4. Manejar errores apropiadamente

```typescript
try {
  // ... operación con perfil
} catch (error) {
  console.error("Profile error:", error);
  toast({ title: "Error", description: "Something went wrong" });
}
```

### 5. Tipo seguro con TypeScript

```typescript
import type { UserProfile, BodyType } from "@/lib/types/user";

function processBodyType(bodyType: BodyType) {
  // TypeScript te ayudará con autocompletado
}
```

---

## 🚀 Próximos Pasos

Ahora que tienes el onboarding funcionando, puedes:

1. **Integrar generación de avatar con IA**
2. **Crear página de perfil de usuario**
3. **Implementar edición de datos**
4. **Mostrar estadísticas y recomendaciones**
5. **Usar los datos para personalizar la experiencia**
