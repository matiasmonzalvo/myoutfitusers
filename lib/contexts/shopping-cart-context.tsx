"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Product } from "@/lib/actions/products";

interface ShoppingCartContextType {
  selectedProducts: Product[];
  addProduct: (product: Product, currentOutfitProducts?: Product[]) => boolean;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
  canAddProduct: (
    product: Product,
    currentOutfitProducts?: Product[]
  ) => boolean;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(
  undefined
);

export function ShoppingCartProvider({ children }: { children: ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const canAddProduct = (
    product: Product,
    currentOutfitProducts: Product[] = []
  ): boolean => {
    // Check if product category is already in cart
    const existingCategoriesInCart = selectedProducts.map((p) => p.category);

    // Check if product category is already in current outfit
    const categoriesInOutfit = currentOutfitProducts.map((p) => p.category);

    // Cannot add if:
    // 1. The category is already in the cart (can't add duplicate categories to cart)
    // 2. The category is already in the current outfit (can't replace items of same category)
    return (
      !existingCategoriesInCart.includes(product.category) &&
      !categoriesInOutfit.includes(product.category)
    );
  };

  const addProduct = (
    product: Product,
    currentOutfitProducts: Product[] = []
  ): boolean => {
    if (!canAddProduct(product, currentOutfitProducts)) {
      return false; // Cannot add product of same category
    }

    setSelectedProducts((prev) => [...prev, product]);
    return true;
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCart = () => {
    setSelectedProducts([]);
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        selectedProducts,
        addProduct,
        removeProduct,
        clearCart,
        canAddProduct,
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error(
      "useShoppingCart must be used within a ShoppingCartProvider"
    );
  }
  return context;
}
