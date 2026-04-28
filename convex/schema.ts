import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  adminUsers: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_username", ["username"]),

  adminSessions: defineTable({
    adminId: v.id("adminUsers"),
    tokenHash: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_admin", ["adminId"])
    .index("by_token_hash", ["tokenHash"]),

  menuCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    displayOrder: v.number(),
    active: v.boolean(),
  }).index("by_slug", ["slug"])
    .index("by_display_order", ["displayOrder"]),

  menuItems: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    priceWithFries: v.optional(v.number()),
    image: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    categories: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    platformPrice: v.optional(v.number()),
    popular: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    categoryOrders: v.optional(v.array(v.object({
      category: v.string(),
      order: v.number(),
    }))),
    active: v.optional(v.boolean()),
    inStock: v.optional(v.boolean()),
  }).index("by_display_order", ["displayOrder"]),

  toppingCategories: defineTable({
    categoryId: v.string(),
    name: v.string(),
    minSelection: v.number(),
    maxSelection: v.optional(v.number()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  }).index("by_display_order", ["displayOrder"]),

  toppings: defineTable({
    toppingId: v.string(),
    name: v.string(),
    price: v.optional(v.number()),
    categoryId: v.string(),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
    menuItemId: v.optional(v.id("menuItems")),
    specialPrice: v.optional(v.number()),
  }).index("by_category", ["categoryId"])
    .index("by_display_order", ["displayOrder"])
    .index("by_topping_id", ["toppingId"])
    .index("by_menu_item", ["menuItemId"]),

  menuItemToppings: defineTable({
    menuItemId: v.id("menuItems"),
    toppingCategoryId: v.string(),
    displayOrder: v.optional(v.number()),
  }).index("by_menu_item", ["menuItemId"]),

  restaurantInfo: defineTable({
    key: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    hours: v.optional(v.array(v.object({
      day: v.string(),
      time: v.string(),
    }))),
    socialLinks: v.optional(v.object({
      facebook: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
    holidays: v.optional(v.array(v.object({
      startDate: v.string(), // ISO date string YYYY-MM-DD
      endDate: v.string(),   // ISO date string YYYY-MM-DD
      name: v.optional(v.string()),
      active: v.boolean(),
    }))),
    pickupEnabled: v.optional(v.boolean()),
    deliveryEnabled: v.optional(v.boolean()),
    minimumAdvanceNotice: v.optional(v.number()), // Minimum minutes before pickup/delivery
    deliveryFees: v.optional(v.array(v.object({
      postalCode: v.string(), // Can be exact, wildcard (57*), or range (57190-57199)
      price: v.number(),
      name: v.optional(v.string()), // e.g., "Zone A", "Zone B"
    }))),
    defaultDeliveryFee: v.optional(v.number()), // Fallback price for unmatched postal codes
    freeDeliveryThreshold: v.optional(v.number()), // Order amount for free delivery (0 = disabled)
    galleryEnabled: v.optional(v.boolean()),
    reviewsEnabled: v.optional(v.boolean()),
  }).index("by_key", ["key"]),

  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  userSessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_token_hash", ["tokenHash"]),

  orders: defineTable({
    userId: v.optional(v.id("users")),
    customer: v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.string(),
    }),
    type: v.union(v.literal("pickup"), v.literal("delivery")),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      zipCode: v.string(),
      instructions: v.optional(v.string()),
    })),
    scheduledTime: v.string(),
    paymentMethod: v.union(v.literal("stripe"), v.literal("cash")),
    paymentStatus: v.union(v.literal("unpaid"), v.literal("paid"), v.literal("failed")),
    stripePaymentIntentId: v.optional(v.string()),
    items: v.array(v.object({
      menuItemId: v.string(),
      name: v.string(),
      price: v.number(),
      selectedToppings: v.optional(v.array(v.object({
        categoryId: v.string(),
        toppingIds: v.array(v.string()),
      }))),
      finalPrice: v.number(),
    })),
    totalPrice: v.number(),
    promoCode: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("delivering"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  promoCodes: defineTable({
    code: v.string(),
    discountType: v.union(
      v.literal("fixed"),
      v.literal("percentage"),
      v.literal("free_delivery"),
      v.literal("percent_off_items"),
      v.literal("percent_off_specific_items"),
      v.literal("bogo_same"),   // 1 acheté = 1 offert (même article)
      v.literal("bogo_gift"),   // 1 acheté = X offert (autre article)
    ),
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxUsageCount: v.optional(v.number()),
    usageCount: v.number(),
    active: v.boolean(),
    expiresAt: v.optional(v.number()),
    description: v.optional(v.string()),
    // Happy hour: time window restriction (any discountType)
    timeWindow: v.optional(v.object({
      startHour: v.number(),
      endHour: v.number(),
    })),
    // Percent off items: category slugs to apply discount to
    applicableCategoryIds: v.optional(v.array(v.string())),
    // Percent off specific items: menu item IDs to apply discount to
    applicableMenuItemIds: v.optional(v.array(v.string())),
    // BOGO gift: trigger item (must be in cart) → gift item (becomes free)
    bogoTriggerItemId: v.optional(v.string()),
    bogoGiftItemId: v.optional(v.string()),
    // false = automatic campaign (no code), true/undefined = promo code (customer must enter)
    requiresCode: v.optional(v.boolean()),
  }).index("by_code", ["code"]),

  reviews: defineTable({
    userId: v.optional(v.id("users")),
    orderId: v.optional(v.id("orders")),
    name: v.string(),
    rating: v.number(),
    comment: v.string(),
    date: v.string(),
    active: v.boolean(),
  }).index("by_active", ["active"])
    .index("by_order", ["orderId"]),

  gallery: defineTable({
    title: v.string(),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    displayOrder: v.optional(v.number()),
    active: v.boolean(),
  }).index("by_active", ["active"])
    .index("by_display_order", ["displayOrder"]),
});
