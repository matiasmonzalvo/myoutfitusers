"use client";

import { useState, useEffect } from "react";
import { createServerClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineSpinner } from "ldrs/react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import {
  uploadMultipleImages,
  deleteImage,
  validateImageFile,
} from "@/lib/utils/storage";

interface Product {
  id: string;
  name: string;
  description?: string;
  images: string[];
  product_link?: string;
  category: string;
  subcategory?: string;
  sex: string;
  is_active: boolean;
}

interface ProductFormProps {
  brandId: string;
  product?: Product | null;
  onSaved: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { value: "tees", label: "T-Shirts" },
  { value: "jacket", label: "Jackets & Coats" },
  { value: "sweatshirts", label: "Hoodies & Sweaters" },
  { value: "bottoms", label: "Bottoms" },
  { value: "footwear", label: "Sneakers & Shoes" },
  { value: "accesories", label: "Accessories" },
];

const SEX_OPTIONS = [
  { value: "men", label: "Hombre" },
  { value: "women", label: "Mujer" },
  { value: "kids", label: "Niños" },
  { value: "unisex", label: "Unisex" },
];

export function ProductForm({
  brandId,
  product,
  onSaved,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    product_link: "",
    category: "tees",
    subcategory: "",
    sex: "unisex",
    is_active: true,
  });
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createServerClient();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        product_link: product.product_link || "",
        category: product.category,
        subcategory: product.subcategory || "",
        sex: product.sex || "unisex",
        is_active: product.is_active,
      });
      setImages(product.images || []);
    }
  }, [product]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate each file
    try {
      files.forEach((file) => validateImageFile(file, 5));
    } catch (err: any) {
      setError(err.message);
      return;
    }

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImageFiles([...imageFiles, ...files]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemoveNewImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleRemoveExistingImage = async (url: string) => {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;

    try {
      await deleteImage(url, "product-images");
      setImages(images.filter((img) => img !== url));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate
    if (!formData.name || !formData.category) {
      setError("Por favor completa los campos requeridos: nombre y categoría");
      setLoading(false);
      return;
    }

    if (images.length === 0 && imageFiles.length === 0) {
      setError("Debes subir al menos una imagen del producto");
      setLoading(false);
      return;
    }

    try {
      if (product) {
        // ====================================
        // ACTUALIZAR PRODUCTO EXISTENTE
        // ====================================
        // En edición, primero subimos imágenes nuevas si las hay
        let uploadedImageUrls: string[] = [];
        if (imageFiles.length > 0) {
          setUploading(true);
          uploadedImageUrls = await uploadMultipleImages(
            imageFiles,
            "product-images",
            brandId
          );
          setUploading(false);
        }

        // Combinar imágenes existentes y nuevas
        const allImages = [...images, ...uploadedImageUrls];

        const productData = {
          name: formData.name,
          description: formData.description || null,
          images: allImages,
          product_link: formData.product_link || null,
          category: formData.category,
          subcategory: formData.subcategory || null,
          sex: formData.sex,
          is_active: formData.is_active,
        };

        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (updateError) throw updateError;
      } else {
        // ====================================
        // CREAR NUEVO PRODUCTO
        // ====================================
        // Paso 1: Crear producto sin imágenes primero
        const productData = {
          brand_id: brandId,
          name: formData.name,
          description: formData.description || null,
          images: images, // Solo imágenes existentes (vacío en nuevos productos)
          product_link: formData.product_link || null,
          category: formData.category,
          subcategory: formData.subcategory || null,
          sex: formData.sex,
          is_active: formData.is_active,
        };

        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();

        if (insertError) throw insertError;

        // Paso 2: Ahora que el producto existe, subir las imágenes
        if (imageFiles.length > 0) {
          setUploading(true);
          const uploadedImageUrls = await uploadMultipleImages(
            imageFiles,
            "product-images",
            brandId
          );
          setUploading(false);

          // Paso 3: Actualizar el producto con las URLs de las imágenes
          const allImages = [...images, ...uploadedImageUrls];

          const { error: updateError } = await supabase
            .from("products")
            .update({ images: allImages })
            .eq("id", newProduct.id);

          if (updateError) {
            console.error(
              "Error al actualizar imágenes del producto:",
              updateError
            );
            // El producto se creó pero sin imágenes - mostramos advertencia
            setError(
              "Producto creado pero hubo un error al guardar las imágenes. Por favor, edita el producto para agregar las imágenes."
            );
          }
        }
      }

      // Clean up previews
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));

      onSaved();
    } catch (err: any) {
      setError(err.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20">
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Producto *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Ej: Air Max 90"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe el producto..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sexo *</Label>
          <Select
            value={formData.sex}
            onValueChange={(value) => handleInputChange("sex", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEX_OPTIONS.map((sex) => (
                <SelectItem key={sex.value} value={sex.value}>
                  {sex.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subcategory">Subcategoría</Label>
        <Input
          id="subcategory"
          value={formData.subcategory}
          onChange={(e) => handleInputChange("subcategory", e.target.value)}
          placeholder="Ej: sneakers, shirt, pants, hat..."
        />
      </div>

      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Imágenes del Producto *</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <label
                htmlFor="image-upload"
                className="cursor-pointer text-sm font-medium text-primary hover:underline"
              >
                Haz clic para subir imágenes
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={loading || uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG o WEBP (máx. 5MB por imagen)
              </p>
            </div>
          </div>
        </div>

        {/* Existing Images */}
        {images.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Imágenes actuales:</p>
            <div className="grid grid-cols-3 gap-3">
              {images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(url)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={loading || uploading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Nuevas imágenes:</p>
            <div className="grid grid-cols-3 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`New ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={loading || uploading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="flex items-center justify-center py-4">
            <LineSpinner
              size="30"
              stroke="3"
              speed="1.1"
              color="var(--primary)"
            />
            <span className="ml-2 text-sm text-muted-foreground">
              Subiendo imágenes...
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_link">Link del Producto</Label>
        <Input
          id="product_link"
          type="url"
          value={formData.product_link}
          onChange={(e) => handleInputChange("product_link", e.target.value)}
          placeholder="https://marca.com/producto"
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => handleInputChange("is_active", e.target.checked)}
          className="w-4 h-4"
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Producto activo (visible para usuarios)
        </Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <LineSpinner
              size="20"
              stroke="3"
              speed="1.1"
              color="var(--background)"
            />
          ) : product ? (
            "Actualizar Producto"
          ) : (
            "Crear Producto"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
