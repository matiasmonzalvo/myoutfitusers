# Sistema de Administración de Marcas - Outfitters

## 📋 Resumen

Este sistema permite a las marcas gestionar sus productos en la plataforma Outfitters, mientras que los usuarios pueden explorar y probarse virtualmente estos productos con sus avatares.

## 🏗️ Arquitectura del Sistema

### Separación de Roles

1. **Usuarios** (Clientes)
   - Se registran y loguean normalmente
   - Navegan por la app
   - Crean avatares
   - Prueban productos virtualmente
   - Ruta: `/` (HomeContent)

2. **Marcas** (Administradores)
   - Registradas manualmente por el administrador
   - Login exclusivo en `/admin`
   - Panel de control en `/admin/dashboard`
   - Gestionan sus productos

## 🚀 Inicio Rápido

### 1. Configuración de Base de Datos

Ejecuta el script SQL en Supabase:

```bash
# Abre Supabase Dashboard → SQL Editor
# Copia y pega el contenido de docs/ADMIN_SETUP.sql
# Ejecuta el script
```

### 2. Registrar Primera Marca

Ver guía completa en: `docs/BRAND_REGISTRATION_GUIDE.md`

**Resumen rápido:**

1. Supabase Dashboard → Authentication → Users → Add user
2. Email: `admin@marca.com`, Password: `[segura]`
3. Copia el User UID
4. Table Editor → brands → Insert row
5. Pega el UID en el campo `id`
6. Completa: `brand_name`, `email`, etc.
7. Guarda

### 3. Probar el Sistema

1. Ve a `http://localhost:3000/admin`
2. Inicia sesión con las credenciales de la marca
3. Agrega productos en el dashboard
4. Verifica que aparecen en `http://localhost:3000/` (HomeContent)

## 📁 Estructura de Archivos

```
app/
├── admin/
│   ├── page.tsx                    # Login de marcas
│   └── dashboard/
│       └── page.tsx                # Dashboard protegido
├── api/
│   └── products/
│       └── route.ts                # API de productos (opcional)

components/
├── admin/
│   ├── admin-dashboard.tsx         # Dashboard principal
│   ├── product-form.tsx            # Formulario de productos
│   └── product-list.tsx            # Lista de productos
├── auth/
│   └── admin-login-form.tsx        # Formulario de login admin
├── products/
│   └── product-card.tsx            # Tarjeta de producto para usuarios
└── card-content/
    └── HomeContent.tsx             # Vista de productos para usuarios

lib/
├── actions/
│   └── products.ts                 # Server actions para productos
└── supabase/
    ├── client.ts
    └── server.ts

docs/
├── ADMIN_SETUP.sql                 # Script SQL
├── BRAND_REGISTRATION_GUIDE.md     # Guía de registro
└── ADMIN_SYSTEM_README.md          # Este archivo

middleware.ts                        # Protección de rutas
```

## 🔐 Seguridad

### Row Level Security (RLS)

El sistema implementa políticas de seguridad a nivel de fila:

1. **Marcas**:
   - Solo pueden ver/editar sus propios datos
   - Solo pueden gestionar sus propios productos
   - Usuarios normales no tienen acceso

2. **Productos**:
   - Marcas solo ven/editan sus productos
   - Usuarios ven todos los productos activos
   - Filtrado automático por `is_active = true`

### Middleware

Protege las rutas de admin:

- `/admin/dashboard` requiere autenticación
- Verifica que el usuario sea una marca activa
- Redirige a `/admin` si no tiene permisos

## 📊 Base de Datos

### Tabla: `brands`

| Campo         | Tipo         | Descripción                     |
| ------------- | ------------ | ------------------------------- |
| id            | UUID         | ID del usuario de Supabase Auth |
| brand_name    | VARCHAR(255) | Nombre de la marca              |
| email         | VARCHAR(255) | Email (único)                   |
| password_hash | TEXT         | Manejado por Supabase Auth      |
| logo_url      | TEXT         | URL del logo                    |
| description   | TEXT         | Descripción de la marca         |
| website_url   | TEXT         | Sitio web                       |
| is_active     | BOOLEAN      | Estado activo/inactivo          |
| created_at    | TIMESTAMP    | Fecha de creación               |
| updated_at    | TIMESTAMP    | Última actualización            |

### Tabla: `products`

| Campo            | Tipo          | Descripción                |
| ---------------- | ------------- | -------------------------- |
| id               | UUID          | ID único del producto      |
| brand_id         | UUID          | FK a brands(id)            |
| name             | VARCHAR(255)  | Nombre del producto        |
| description      | TEXT          | Descripción                |
| price            | DECIMAL(10,2) | Precio en USD              |
| image_url        | TEXT          | URL de imagen principal    |
| product_link     | TEXT          | Link de compra             |
| category         | VARCHAR(50)   | upper/lower/foot/accessory |
| subcategory      | VARCHAR(100)  | Subcategoría específica    |
| available_sizes  | TEXT[]        | Array de tallas            |
| available_colors | TEXT[]        | Array de colores           |
| is_active        | BOOLEAN       | Visible para usuarios      |
| created_at       | TIMESTAMP     | Fecha de creación          |
| updated_at       | TIMESTAMP     | Última actualización       |

## 🎨 Categorías de Productos

```typescript
type Category =
  | "tees"
  | "jacket"
  | "sweatshirt"
  | "bottoms"
  | "footwear"
  | "accesories";
```

- **tees**: T-Shirts (camisetas, polos, etc.)
- **jacket**: Jackets & Coats (chaquetas, abrigos, etc.)
- **sweatshirt**: Hoodies & Sweaters (sudaderas, hoodies, etc.)
- **bottoms**: Bottoms (pantalones, shorts, etc.)
- **footwear**: Sneakers & Shoes (zapatos, sneakers, etc.)
- **accesories**: Accesories (gorras, bolsos, etc.)

## 🔄 Flujo de Trabajo

### Para el Administrador (Tú)

1. Registrar nueva marca manualmente
2. Proporcionar credenciales a la marca
3. Monitorear actividad (opcional)
4. Activar/desactivar marcas según necesidad

### Para las Marcas

1. Recibir credenciales del administrador
2. Iniciar sesión en `/admin`
3. Acceder al dashboard
4. Agregar productos:
   - Nombre, descripción, precio
   - Imagen del producto
   - Categoría y subcategoría
   - Tallas y colores disponibles
   - Link de compra
5. Editar/eliminar productos existentes
6. Los productos aparecen automáticamente en la app

### Para los Usuarios

1. Navegar a la página principal
2. Ver productos de todas las marcas
3. Filtrar por categoría (futuro)
4. Hacer clic en "Probar" para probarse el producto
5. Hacer clic en link externo para comprar

## 🛠️ Funcionalidades Implementadas

✅ Login de marcas separado del login de usuarios
✅ Dashboard de administración para marcas
✅ CRUD completo de productos
✅ Validación de permisos con RLS
✅ Middleware de protección de rutas
✅ Vista de productos en HomeContent
✅ Tarjetas de producto con información completa
✅ Soporte para múltiples imágenes (preparado)
✅ Sistema de categorías
✅ Tallas y colores dinámicos
✅ Estados activo/inactivo

## 🔮 Funcionalidades Futuras

- [ ] Upload de imágenes directo (actualmente URL)
- [ ] Múltiples imágenes por producto
- [ ] Soporte para modelos 3D
- [ ] Filtros avanzados en HomeContent
- [ ] Búsqueda de productos
- [ ] Analytics para marcas
- [ ] Sistema de notificaciones
- [ ] Integración con avatar para try-on

## 📝 Comandos SQL Útiles

### Ver todas las marcas

```sql
SELECT brand_name, email, is_active, created_at
FROM brands
ORDER BY created_at DESC;
```

### Ver productos de una marca

```sql
SELECT p.name, p.category, p.price, p.is_active, b.brand_name
FROM products p
JOIN brands b ON p.brand_id = b.id
WHERE b.brand_name = 'Nike'
ORDER BY p.created_at DESC;
```

### Contar productos por categoría

```sql
SELECT category, COUNT(*) as total
FROM products
WHERE is_active = true
GROUP BY category;
```

### Marcas más activas

```sql
SELECT b.brand_name, COUNT(p.id) as total_products
FROM brands b
LEFT JOIN products p ON b.id = p.brand_id
WHERE b.is_active = true
GROUP BY b.id, b.brand_name
ORDER BY total_products DESC;
```

## 🐛 Debugging

### Problema: No aparecen productos en HomeContent

1. Verifica que los productos existan:

   ```sql
   SELECT * FROM products WHERE is_active = true;
   ```

2. Verifica RLS:

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'products';
   ```

3. Revisa logs del servidor Next.js

### Problema: Marca no puede agregar productos

1. Verifica que la marca esté activa:

   ```sql
   SELECT * FROM brands WHERE email = 'admin@marca.com';
   ```

2. Verifica que el `brand_id` coincida con el user ID de Auth

3. Revisa políticas RLS de la tabla `products`

## 📞 Soporte

Para problemas o dudas:

1. Revisa `docs/BRAND_REGISTRATION_GUIDE.md`
2. Revisa `docs/ADMIN_SETUP.sql`
3. Verifica logs de Supabase
4. Contacta al desarrollador

## 🎉 ¡Listo!

El sistema está completamente funcional. Ahora puedes:

1. Registrar marcas
2. Las marcas pueden agregar productos
3. Los usuarios ven los productos en la app

¡Disfruta de Outfitters! 🚀
