# 🚀 Quick Start - Outfitters Admin System

## ⚡ Setup en 5 Minutos

### 1️⃣ Ejecutar SQL y Crear Buckets (2 min)

```bash
# SQL
1. Abre Supabase Dashboard
2. Ve a SQL Editor
3. Copia todo de docs/ADMIN_SETUP.sql
4. Pega y ejecuta

# Storage Buckets
5. Ve a Storage
6. Crear bucket: "brand-logos" (Public ✅)
7. Crear bucket: "product-images" (Public ✅)
```

### 2️⃣ Registrar Primera Marca (2 min)

```bash
1. Supabase → Authentication → Users → Add user
   Email: admin@nike.com
   Password: Nike123!
   ✅ Auto Confirm User

2. Copia el User UID (ej: abc123-def456-...)

3. Supabase → Table Editor → brands → Insert row
   id: [pega el UID]
   brand_name: Nike
   email: admin@nike.com
   password_hash: handled-by-supabase-auth
   is_active: true
   (otros campos opcionales)

4. Save
```

### 3️⃣ Probar (2 min)

```bash
1. Ve a http://localhost:3000/admin
2. Login: admin@nike.com / Nike123!
3. Agrega un producto de prueba
4. Ve a http://localhost:3000/
5. ¡Deberías ver el producto!
```

## 📍 URLs Importantes

| Ruta               | Descripción                   |
| ------------------ | ----------------------------- |
| `/admin`           | Login de marcas               |
| `/admin/dashboard` | Panel de control de marca     |
| `/`                | Vista de usuarios (productos) |
| `/login`           | Login de usuarios normales    |

## 🔑 Credenciales de Ejemplo

```
Marca: Nike
Email: admin@nike.com
Password: [la que estableciste]
```

## 📦 Estructura de Producto

```json
{
  "name": "Air Max 90",
  "description": "Classic Nike sneakers",
  "price": 129.99,
  "image_url": "https://example.com/airmax.jpg",
  "product_link": "https://nike.com/airmax90",
  "category": "footwear",
  "subcategory": "sneakers",
  "available_sizes": ["7", "8", "9", "10", "11"],
  "available_colors": ["black", "white", "red"],
  "is_active": true
}
```

## 🎯 Categorías

- `upper` - Parte superior (camisetas, chaquetas)
- `lower` - Parte inferior (pantalones, shorts)
- `foot` - Calzado (zapatos, sneakers)
- `accessory` - Accesorios (gorras, gafas)

## 🔧 Comandos SQL Útiles

### Ver todas las marcas

```sql
SELECT brand_name, email, is_active FROM brands;
```

### Ver todos los productos

```sql
SELECT p.name, b.brand_name, p.category, p.price
FROM products p
JOIN brands b ON p.brand_id = b.id;
```

### Desactivar marca

```sql
UPDATE brands SET is_active = false WHERE email = 'admin@nike.com';
```

### Activar marca

```sql
UPDATE brands SET is_active = true WHERE email = 'admin@nike.com';
```

## ❓ Troubleshooting Rápido

| Problema                         | Solución                                                  |
| -------------------------------- | --------------------------------------------------------- |
| "No tienes permisos"             | Verifica que el `id` en `brands` coincida con el User UID |
| "Cuenta desactivada"             | `UPDATE brands SET is_active = true WHERE email = '...'`  |
| No aparecen productos            | Verifica `is_active = true` en productos                  |
| Marca no puede agregar productos | Verifica RLS policies con el script SQL                   |

## 📚 Documentación Completa

- **Setup completo**: `docs/ADMIN_SYSTEM_README.md`
- **Registro de marcas**: `docs/BRAND_REGISTRATION_GUIDE.md`
- **Configuración de Storage**: `docs/STORAGE_SETUP_GUIDE.md`
- **Script SQL**: `docs/ADMIN_SETUP.sql`

## ✅ Checklist

- [ ] Script SQL ejecutado
- [ ] Buckets de Storage creados (brand-logos, product-images)
- [ ] Primera marca registrada
- [ ] Login en `/admin` funciona
- [ ] Producto de prueba creado CON IMAGEN
- [ ] Producto visible en `/` con imagen
- [ ] Todo funciona 🎉

---

**¿Necesitas ayuda?** Revisa `docs/BRAND_REGISTRATION_GUIDE.md` para más detalles.
