"use client";

import { useState, useEffect } from "react";
import { createServerClient } from "@/lib/supabase/client";
import { ProductForm } from "@/components/admin/product-form";
import { ProductList } from "@/components/admin/product-list";
import { Plus, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  images: string[];
  product_link?: string;
  category: string;
  subcategory?: string;
  sex: string;
  is_active: boolean;
  created_at: string;
}

interface AdminProductsViewProps {
  brandId: string;
}

const GENDER_OPTIONS = [
  { value: "all", label: "All Genders" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
  { value: "kids", label: "Kids" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "tees", label: "T-Shirts" },
  { value: "jacket", label: "Jackets & Coats" },
  { value: "sweatshirts", label: "Hoodies & Sweaters" },
  { value: "bottoms", label: "Bottoms" },
  { value: "footwear", label: "Sneakers & Shoes" },
  { value: "accesories", label: "Accessories" },
];

export function AdminProductsView({ brandId }: AdminProductsViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const supabase = createServerClient();

  useEffect(() => {
    loadProducts();
  }, [brandId]);

  useEffect(() => {
    applyFilters();
  }, [products, selectedGender, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (selectedGender !== "all") {
      filtered = filtered.filter((p) => p.sex === selectedGender);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (!error) {
      await loadProducts();
    }
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold tracking-tighter">Products</h1>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <button
            className="text-primary flex items-center justify-center gap-2 rounded-full cursor-pointer hover:opacity-90 transition-all text-base font-medium tracking-tight"
            onClick={handleAddProduct}
          >
            Add Product
          </button>

          {/* Filtros */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium tracking-tight text-muted-foreground">
                Filters:
              </span>
            </div>

            {/* Filtro de Género */}
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="w-[150px] rounded-full border-border bg-white text-sm font-medium tracking-tight hover:bg-neutral-50 transition-colors">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl border-border">
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer hover:bg-neutral-100 rounded-lg"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de Categoría */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px] rounded-full border-border bg-white text-sm font-medium tracking-tight hover:bg-neutral-50 transition-colors">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl border-border">
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer hover:bg-neutral-100 rounded-lg"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Badge con contador de productos filtrados */}
            {(selectedGender !== "all" || selectedCategory !== "all") && (
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-tight">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <ProductList
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      )}

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {editingProduct ? "Editar Producto" : "Agregar Producto"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            brandId={brandId}
            product={editingProduct}
            onSaved={handleProductSaved}
            onCancel={() => setShowProductForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
