/**
 * Script para registrar marcas automáticamente
 *
 * IMPORTANTE: Este script requiere la SUPABASE_SERVICE_ROLE_KEY
 * que NUNCA debe ser expuesta públicamente.
 *
 * Uso:
 * 1. Copia este archivo como register-brand.js
 * 2. Configura las variables de entorno
 * 3. Modifica los datos de la marca abajo
 * 4. Ejecuta: node scripts/register-brand.js
 */

// Requiere: npm install @supabase/supabase-js
const { createClient } = require("@supabase/supabase-js");

// ⚠️ NUNCA expongas esta key en el frontend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Faltan variables de entorno");
  console.error("Asegúrate de tener:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Registra una nueva marca en el sistema
 */
async function registerBrand(brandData) {
  console.log("🚀 Iniciando registro de marca:", brandData.brand_name);

  try {
    // Paso 1: Crear usuario en Supabase Auth
    console.log("📝 Creando usuario en Auth...");
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: brandData.email,
        password: brandData.password,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          brand_name: brandData.brand_name,
        },
      });

    if (authError) {
      throw new Error(`Error en Auth: ${authError.message}`);
    }

    console.log("✅ Usuario creado con ID:", authData.user.id);

    // Paso 2: Insertar marca en la tabla brands
    console.log("📝 Registrando marca en la base de datos...");
    const { data: brandRecord, error: brandError } = await supabase
      .from("brands")
      .insert([
        {
          id: authData.user.id,
          brand_name: brandData.brand_name,
          email: brandData.email,
          password_hash: "handled-by-supabase-auth",
          description: brandData.description || null,
          website_url: brandData.website_url || null,
          logo_url: brandData.logo_url || null,
          contact_person: brandData.contact_person || null,
          phone: brandData.phone || null,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (brandError) {
      // Si falla, intentar eliminar el usuario de Auth
      console.error("❌ Error al insertar marca, limpiando usuario de Auth...");
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Error en DB: ${brandError.message}`);
    }

    console.log("✅ Marca registrada exitosamente!");
    console.log("\n📋 Detalles de la marca:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("ID:", authData.user.id);
    console.log("Nombre:", brandData.brand_name);
    console.log("Email:", brandData.email);
    console.log("Password:", brandData.password);
    console.log("Login URL: /admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return {
      user: authData.user,
      brand: brandRecord,
    };
  } catch (error) {
    console.error("❌ Error al registrar marca:", error.message);
    throw error;
  }
}

/**
 * Registrar múltiples marcas
 */
async function registerMultipleBrands(brands) {
  console.log(`🎯 Registrando ${brands.length} marca(s)...\n`);

  const results = [];

  for (const brand of brands) {
    try {
      const result = await registerBrand(brand);
      results.push({ success: true, brand: brand.brand_name, data: result });
      console.log("✅ Éxito:", brand.brand_name, "\n");
    } catch (error) {
      results.push({
        success: false,
        brand: brand.brand_name,
        error: error.message,
      });
      console.error("❌ Fallo:", brand.brand_name, "\n");
    }
  }

  // Resumen
  console.log("\n📊 RESUMEN");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Total: ${results.length}`);
  console.log(`Éxitos: ${results.filter((r) => r.success).length}`);
  console.log(`Fallos: ${results.filter((r) => !r.success).length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  return results;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURACIÓN DE MARCAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const brandsToRegister = [
  {
    email: "admin@nike.com",
    password: "Nike123!SecurePassword", // Usa una contraseña segura
    brand_name: "Nike",
    description: "Just Do It - Leading sportswear brand",
    website_url: "https://www.nike.com",
    logo_url: "https://example.com/nike-logo.png",
    contact_person: "John Doe",
    phone: "+1234567890",
  },
  // Agrega más marcas aquí
  /*
  {
    email: 'admin@adidas.com',
    password: 'Adidas123!SecurePassword',
    brand_name: 'Adidas',
    description: 'Impossible is Nothing',
    website_url: 'https://www.adidas.com',
    logo_url: 'https://example.com/adidas-logo.png',
  },
  */
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EJECUCIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Ejecutar el registro
registerMultipleBrands(brandsToRegister)
  .then(() => {
    console.log("✅ Proceso completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
