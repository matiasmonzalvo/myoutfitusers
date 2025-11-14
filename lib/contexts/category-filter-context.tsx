"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type FilterCategory =
  | "all"
  | "tees"
  | "jacket"
  | "sweatshirts"
  | "bottoms"
  | "footwear"
  | "accesories";

export const CATEGORY_LABELS: Record<FilterCategory, string> = {
  all: "All",
  tees: "T-Shirts",
  jacket: "Jackets & Coats",
  sweatshirts: "Hoodies & Sweaters",
  bottoms: "Bottoms",
  footwear: "Sneakers & Shoes",
  accesories: "Accesories",
};

interface CategoryFilterContextType {
  selectedFilter: FilterCategory;
  setSelectedFilter: (filter: FilterCategory) => void;
}

const CategoryFilterContext = createContext<
  CategoryFilterContextType | undefined
>(undefined);

export function CategoryFilterProvider({ children }: { children: ReactNode }) {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");

  return (
    <CategoryFilterContext.Provider
      value={{ selectedFilter, setSelectedFilter }}
    >
      {children}
    </CategoryFilterContext.Provider>
  );
}

export function useCategoryFilter() {
  const context = useContext(CategoryFilterContext);
  if (context === undefined) {
    throw new Error(
      "useCategoryFilter must be used within a CategoryFilterProvider"
    );
  }
  return context;
}
