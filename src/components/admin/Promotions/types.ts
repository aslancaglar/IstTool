import {
  Percent, Euro, Truck, Clock, ShoppingBag, Package,
} from "lucide-react";

export type DiscountType = "percentage" | "fixed" | "free_delivery" | "percent_off_items" | "percent_off_specific_items" | "bogo_same" | "bogo_gift";

export type PromoTemplate = {
  id: string;
  discountType: DiscountType;
  icon: React.ElementType;
  label: string;
  example: string;
  color: string;
  isHappyHour?: boolean;
};

// Templates for PROMO CODES (with code input)
export const CODE_TEMPLATES: PromoTemplate[] = [
  { id: "percentage", discountType: "percentage", icon: Percent, label: "% sur la commande", example: "Ex: 20% de réduction", color: "blue" },
  { id: "fixed", discountType: "fixed", icon: Euro, label: "€ sur la commande", example: "Ex: 5€ de réduction", color: "green" },
  { id: "free_delivery", discountType: "free_delivery", icon: Truck, label: "Livraison gratuite", example: "Annule les frais de livraison", color: "purple" },
  { id: "happy_hour", discountType: "percentage", icon: Clock, label: "Happy hour", example: "Ex: 20% de 14h à 17h", color: "amber", isHappyHour: true },
  { id: "percent_off_items", discountType: "percent_off_items", icon: ShoppingBag, label: "% sur une catégorie", example: "Ex: 20% sur les Pizzas", color: "rose" },
  { id: "percent_off_specific_items", discountType: "percent_off_specific_items", icon: Package, label: "% sur articles spécifiques", example: "Ex: 20% sur le Big Burger", color: "orange" },
];

// Templates for CAMPAIGNS (automatic, no code)
export const CAMPAIGN_TEMPLATES: PromoTemplate[] = [
  { id: "percentage", discountType: "percentage", icon: Percent, label: "% sur toute la commande", example: "Ex: 20% sur tout le menu", color: "blue" },
  { id: "fixed", discountType: "fixed", icon: Euro, label: "Montant fixe déduit", example: "Ex: 5€ de réduction automatique", color: "green" },
  { id: "free_delivery", discountType: "free_delivery", icon: Truck, label: "Livraison gratuite", example: "Livraison offerte pour tous", color: "purple" },
  { id: "happy_hour", discountType: "percentage", icon: Clock, label: "Happy hour", example: "Ex: 20% automatique de 14h à 17h", color: "amber", isHappyHour: true },
  { id: "percent_off_items", discountType: "percent_off_items", icon: ShoppingBag, label: "% sur une catégorie", example: "Ex: 20% sur les Pizzas automatiquement", color: "rose" },
  { id: "percent_off_specific_items", discountType: "percent_off_specific_items", icon: Package, label: "% sur articles spécifiques", example: "Ex: 20% sur le Big Burger automatiquement", color: "orange" },
  { id: "bogo_same", discountType: "bogo_same", icon: ShoppingBag, label: "1 acheté = 1 offert (même article)", example: "Ex: 2 Pizzas → 1 offerte automatiquement", color: "violet" },
  { id: "bogo_gift", discountType: "bogo_gift", icon: Package, label: "1 acheté = 1 autre offert", example: "Ex: Big Burger → Boisson offerte auto.", color: "pink" },
];

export const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  rose: "bg-rose-50 border-rose-200 text-rose-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  violet: "bg-violet-50 border-violet-200 text-violet-700",
  pink: "bg-pink-50 border-pink-200 text-pink-700",
};

export const ICON_COLOR: Record<string, string> = {
  blue: "text-blue-500 bg-blue-100",
  green: "text-green-500 bg-green-100",
  purple: "text-purple-500 bg-purple-100",
  amber: "text-amber-500 bg-amber-100",
  rose: "text-rose-500 bg-rose-100",
  orange: "text-orange-500 bg-orange-100",
  violet: "text-violet-500 bg-violet-100",
  pink: "text-pink-500 bg-pink-100",
};

export interface PromoFormData {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxUsageCount: string;
  active: boolean;
  expiresAt: string;
  description: string;
  isHappyHour: boolean;
  startHour: string;
  endHour: string;
  applicableCategoryIds: string[];
  applicableMenuItemIds: string[];
  bogoTriggerItemId: string;
  bogoGiftItemId: string;
}

export const emptyForm = (tmpl?: PromoTemplate): PromoFormData => ({
  code: "",
  discountType: tmpl?.discountType ?? "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxUsageCount: "",
  active: true,
  expiresAt: "",
  description: "",
  isHappyHour: tmpl?.isHappyHour ?? false,
  startHour: "12",
  endHour: "14",
  applicableCategoryIds: [],
  applicableMenuItemIds: [],
  bogoTriggerItemId: "",
  bogoGiftItemId: "",
});

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const fmtHour = (h: number) => `${String(h).padStart(2, "0")}:00`;

export function templateForPromo(promo: any, isCampaign: boolean): PromoTemplate {
  const templates = isCampaign ? CAMPAIGN_TEMPLATES : CODE_TEMPLATES;
  if (promo.discountType === "bogo_gift") return CAMPAIGN_TEMPLATES.find(t => t.discountType === "bogo_gift")!;
  if (promo.discountType === "bogo_same") return CAMPAIGN_TEMPLATES.find(t => t.discountType === "bogo_same")!;
  if (promo.timeWindow) return templates.find(t => t.isHappyHour) ?? templates[0];
  return templates.find(t => t.discountType === promo.discountType && !t.isHappyHour) ?? templates[1];
}
