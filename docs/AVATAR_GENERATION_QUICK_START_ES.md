# 🎨 Generación de Avatares - Guía Rápida

## ✅ **SÍ, debes ejecutar SQL en Supabase**

---

## 🚀 Instalación en 4 Pasos (5 minutos)

### 1️⃣ Instalar Dependencia (1 min)

```bash
npm install @google/genai
```

### 2️⃣ Crear Buckets en Supabase (2 min)

1. Ve a **Supabase Dashboard** → **Storage**
2. Click en **Create bucket** (dos veces)

**Bucket 1:**

- Nombre: `user-photos`
- Public: **NO** ❌ (privado)

**Bucket 2:**

- Nombre: `user-avatars`
- Public: **SÍ** ✅ (público)

### 3️⃣ Ejecutar SQL (1 min)

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega TODO de `docs/AVATAR_GENERATION_SETUP.sql`
3. Click en **Run**

Esto agregará:

- Columna `avatar_regenerations_left` (contador de regeneraciones)
- Políticas de Storage
- Funciones auxiliares

### 4️⃣ Configurar API Key de Google (1 min)

1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click en **Get API Key**
3. Copia tu API key
4. Agrégala a tu archivo `.env.local`:

```env
GOOGLE_GEMINI_API_KEY=tu_api_key_aqui
```

5. **Reinicia tu servidor de desarrollo**

---

## 🎯 ¿Qué hace esto?

### Nuevo Flujo de Onboarding (3 Pasos)

```
PASO 1: Completar Perfil
  - Username
  - Age, Gender
  - Height, Weight
  - Body Type
  [Botón: "Continue"] ← Cambiado de "Complete Setup"
    ↓
PASO 2: Subir Fotos 📸
  - Foto cuerpo completo (requerida)
  - Foto de cara (requerida)
  - Notas adicionales (opcional)
  [Botón: "Create Avatar"]
    ↓
  [Generando avatar con IA... 10-30 segundos]
    ↓
PASO 3: Preview del Avatar 🎉
  - Ver avatar generado
  [Botón: "Re-generate" (max 3 veces)]
  [Botón: "Complete Setup"]
    ↓
  ✅ Onboarding Completado!
```

---

## 🎨 Sistema de Regeneraciones

Cada usuario tiene **3 intentos de regeneración**:

- **Primera generación:** Gratis (cuenta como 1)
- **Regeneración 1:** Quedan 2
- **Regeneración 2:** Queda 1
- **Regeneración 3:** Quedan 0
- **Después de 0:** Botón deshabilitado

---

## 🧪 Probar

1. Ejecuta:

   ```bash
   npm run dev
   ```

2. Crea un usuario nuevo en `/register`

3. Completa el paso 1 (perfil)

4. Click en **Continue**

5. Sube las 2 fotos en el paso 2

6. Click en **Create Avatar**

7. Espera 10-30 segundos

8. ¡Deberías ver tu avatar!

9. Prueba **Re-generate** (máximo 3 veces)

10. Click en **Complete Setup**

---

## 📁 Archivos Nuevos/Modificados

### Creados

✅ `app/api/generate-avatar/route.ts` - API para generar avatares  
✅ `docs/AVATAR_GENERATION_SETUP.sql` - SQL para ejecutar  
✅ `docs/AVATAR_GENERATION_INSTALLATION.md` - Guía completa en inglés  
✅ `docs/AVATAR_GENERATION_QUICK_START_ES.md` - Esta guía

### Modificados

✅ `components/auth/onboarding-form.tsx` - Ahora tiene 3 pasos  
✅ `lib/types/user.ts` - Agregado `avatar_regenerations_left`

---

## 🔄 Cómo Funciona (Técnico)

1. Usuario sube 2 fotos (cuerpo completo + cara)
2. Se convierten a base64
3. Se envían a `/api/generate-avatar` junto con:
   - Datos del perfil (age, gender, height, weight, body_type)
   - Notas adicionales (opcional)
4. La API llama a **Google Gemini AI** (modelo: `gemini-2.5-flash-image`)
5. Gemini genera un avatar 3D realista basado en:
   - Las 2 fotos
   - Los datos físicos del usuario
   - Un system prompt detallado
6. La imagen generada se guarda en **Supabase Storage** (`user-avatars` bucket)
7. Se obtiene la URL pública
8. Se decrementa el contador de regeneraciones
9. Se devuelve la URL al frontend
10. Usuario puede regenerar (hasta 3 veces)
11. Al confirmar, se guarda `avatar_url` en `user_profiles` y se completa el onboarding

---

## 🔐 Seguridad

- ✅ Las fotos del usuario se suben a bucket **privado** (`user-photos`)
- ✅ Los avatares generados se guardan en bucket **público** (`user-avatars`)
- ✅ La API Key de Google **nunca** se expone al cliente
- ✅ Límite de 3 regeneraciones por usuario
- ✅ Validación de tamaño (máx 10MB por imagen)
- ✅ Validación de tipo de archivo (solo imágenes)

---

## 🐛 Problemas Comunes

### Error: "Authentication required"

→ Usuario no está logueado

### Error: "No regenerations left"

→ Usuario ya usó sus 3 regeneraciones  
→ Puedes resetear con SQL:

```sql
UPDATE user_profiles
SET avatar_regenerations_left = 3
WHERE username = 'nombre_usuario';
```

### Error: "Failed to upload avatar"

→ Verifica que los buckets existan y tengan las políticas correctas

### La generación tarda mucho

→ Es normal, puede tomar 10-30 segundos
→ Ya hay un spinner de carga implementado

### La API Key no funciona

→ Verifica que esté en `.env.local`  
→ **Reinicia el servidor** después de agregarla  
→ Verifica que la key sea válida en Google AI Studio

---

## ⚠️ IMPORTANTE

### Antes de Hacer Push a Git

Asegúrate de que `.env.local` esté en tu `.gitignore`:

```gitignore
# .gitignore
.env.local
.env*.local
```

**NUNCA** subas tu API Key a GitHub!

---

## 💰 Costos

### Google Gemini API

- Revisa precios actuales en: [Google AI Studio Pricing](https://ai.google.dev/pricing)
- Hay tier gratuito para desarrollo

### Supabase Storage

- Tier gratuito: 1GB
- Avatares pesan aprox 1-3MB cada uno
- Con 1GB puedes almacenar ~300-1000 avatares

---

## 🎯 Personalización

### Cambiar el Prompt de IA

Edita el `systemPrompt` en `app/api/generate-avatar/route.ts`:

```typescript
const systemPrompt = `You are an expert AI avatar generator...`;
```

Puedes cambiar:

- El estilo (fotorealista, cartoon, 3D, etc.)
- La calidad de la imagen
- El tipo de ropa
- El fondo
- Los detalles

### Cambiar Límite de Regeneraciones

En `docs/AVATAR_GENERATION_SETUP.sql`:

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_regenerations_left INTEGER DEFAULT 3; -- Cambia el 3
```

O para un usuario específico:

```sql
UPDATE user_profiles
SET avatar_regenerations_left = 5
WHERE username = 'usuario_especial';
```

---

## ✅ Checklist Final

- [ ] ✅ `npm install @google/genai` ejecutado
- [ ] ✅ Bucket `user-photos` creado (privado)
- [ ] ✅ Bucket `user-avatars` creado (público)
- [ ] ✅ SQL ejecutado (`AVATAR_GENERATION_SETUP.sql`)
- [ ] ✅ API Key agregada a `.env.local`
- [ ] ✅ Servidor reiniciado
- [ ] ✅ Probado con un usuario nuevo
- [ ] ✅ Avatar generado correctamente
- [ ] ✅ Regeneración funciona (hasta 3 veces)
- [ ] ✅ "Complete Setup" guarda el avatar y completa el onboarding

---

## 🎉 ¡Listo!

Ahora tus usuarios pueden:

1. Registrarse
2. Completar su perfil
3. Subir 2 fotos
4. **Generar su avatar personalizado con IA**
5. Regenerarlo hasta 3 veces
6. Completar el onboarding

El avatar se guardará en `user_profiles.avatar_url` y podrás usarlo en toda tu app.

---

## 📞 ¿Necesitas Ayuda?

Revisa:

1. Logs de Supabase Dashboard
2. Consola del navegador (F12)
3. Logs del servidor Next.js
4. Que todas las variables de entorno estén configuradas
5. Que el SQL se haya ejecutado correctamente

---

**¡Disfruta creando avatares con IA! 🎨✨**
