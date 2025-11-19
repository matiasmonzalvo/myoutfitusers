// Try-ons Package System Types

export interface TryonsPackage {
  id: string;
  name: string; // 'small', 'medium', 'large'
  try_ons_count: number;
  price_usd: number;
  price_per_tryon: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackagePurchase {
  id: string;
  user_id: string;
  package_id: string;
  package_name: string;
  try_ons_purchased: number;
  price_paid: number;
  payment_method: string | null;
  payment_id: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
}

export interface TryonsUsage {
  id: string;
  user_id: string;
  action: string;
  products_used: string[] | null;
  was_free: boolean;
  created_at: string;
}

export interface UserTryonsStats {
  try_ons_left: number;
  total_purchased: number;
  total_used: number;
  total_spent: number;
  last_purchase_date: string | null;
}

export interface BillingDashboard {
  try_ons_left: number;
  stats: UserTryonsStats;
  recent_purchases: PackagePurchase[];
  recent_usage: TryonsUsage[];
  available_packages: TryonsPackage[];
}






