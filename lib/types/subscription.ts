// Tipos para el sistema de suscripciones con Polar.sh

export type PlanType = "basic" | "pro" | "ultra";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "incomplete" | "trialing";

export interface UserSubscription {
  id: string;
  user_id: string;
  polar_subscription_id: string | null;
  polar_customer_id: string;
  polar_product_id: string;
  polar_price_id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  subscription_id: string | null;
  action_type: string;
  unit_cost: number;
  quantity: number;
  total_cost: number;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
}

export interface MonthlyUsageSummary {
  id: string;
  user_id: string;
  subscription_id: string | null;
  year: number;
  month: number;
  total_generations: number;
  included_generations: number;
  overage_generations: number;
  fixed_cost: number;
  overage_cost: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface PlanConfig {
  type: PlanType;
  name: string;
  description: string;
  fixedPrice: number; // Precio mensual fijo (0 para Basic)
  includedGenerations: number; // Generaciones incluidas (0 para Basic)
  overagePrice: number; // Precio por generación extra
  features: string[];
  popular?: boolean;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  basic: {
    type: "basic",
    name: "Basic",
    description: "Pay only for what you use",
    fixedPrice: 0,
    includedGenerations: 0,
    overagePrice: 0.06,
    features: [
      "Pay per use: $0.06 per outfit generation",
      "All products catalog",
      "HD avatar generation",
      "Download outfits",
      "Community support",
    ],
  },
  pro: {
    type: "pro",
    name: "Pro",
    description: "Best for regular users",
    fixedPrice: 15,
    includedGenerations: 300,
    overagePrice: 0.05,
    features: [
      "300 outfit generations included",
      "$0.05 per additional generation",
      "All products catalog",
      "HD avatar generation",
      "Priority support",
      "Download outfits",
      "Save favorite outfits",
    ],
    popular: true,
  },
  ultra: {
    type: "ultra",
    name: "Ultra",
    description: "For power users",
    fixedPrice: 45,
    includedGenerations: 1000,
    overagePrice: 0.045,
    features: [
      "1,000 outfit generations included",
      "$0.045 per additional generation",
      "All products catalog",
      "HD avatar generation",
      "Priority support",
      "Download outfits",
      "Save unlimited outfits",
      "Early access to new features",
    ],
  },
};

export interface CurrentPeriodUsage {
  total_generations: number;
  overage_generations: number;
  total_cost: number;
  included_generations: number;
  remaining_generations: number;
  next_billing_date: string;
  current_plan: PlanType;
}

export interface UsageCalculation {
  canGenerate: boolean;
  cost: number;
  reason?: string;
}

// Función helper para calcular el costo de una generación
export function calculateGenerationCost(
  plan: PlanType,
  currentPeriodGenerations: number
): number {
  const config = PLAN_CONFIGS[plan];
  
  // Si estamos dentro del límite incluido, el costo es 0
  if (currentPeriodGenerations < config.includedGenerations) {
    return 0;
  }
  
  // Si excedemos el límite, usamos el precio de overage
  return config.overagePrice;
}

// Función helper para formatear moneda
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Tipos de eventos de webhook de Polar
export type PolarWebhookEvent =
  | "subscription.created"
  | "subscription.updated"
  | "subscription.canceled"
  | "subscription.revoked"
  | "order.created"
  | "checkout.created"
  | "checkout.updated";

export interface PolarWebhookPayload {
  type: PolarWebhookEvent;
  data: any;
}

