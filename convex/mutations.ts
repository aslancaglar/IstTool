import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession, requireUserSession } from "./lib/auth";

export const createOrder = mutation({
  args: {
    sessionToken: v.optional(v.string()),
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
      selectedSize: v.optional(v.union(
        v.literal("seul"),
        v.literal("frites"),
        v.literal("menu")
      )),
      selectedToppings: v.optional(v.array(v.object({
        categoryId: v.string(),
        toppingIds: v.array(v.string()),
      }))),
      finalPrice: v.number(),
    })),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const sessionUser = args.sessionToken
      ? await requireUserSession(ctx, args.sessionToken)
      : null;

    // ── Server-side price validation ──────────────────────────────
    const verifiedItems = [];
    let computedTotal = 0;

    for (const item of args.items) {
      // Look up the actual menu item from the database
      const menuItem = await ctx.db
        .query("menuItems")
        .filter((q) => q.eq(q.field("_id"), item.menuItemId))
        .first();

      if (!menuItem) {
        throw new Error(`Article introuvable: ${item.name}`);
      }

      if (menuItem.active === false) {
        throw new Error(`Article indisponible: ${menuItem.name}`);
      }

      // Calculate the verified price from the DB
      let verifiedPrice = menuItem.price;

      // Add topping surcharges if any
      if (item.selectedToppings && item.selectedToppings.length > 0) {
        for (const toppingGroup of item.selectedToppings) {
          for (const toppingId of toppingGroup.toppingIds) {
            const topping = await ctx.db
              .query("toppings")
              .filter((q) => q.eq(q.field("toppingId"), toppingId))
              .first();
            if (topping?.price) {
              verifiedPrice += topping.price;
            }
          }
        }
      }

      // Verify the client-sent price matches (allow €0.02 tolerance for floating point)
      if (Math.abs(verifiedPrice - item.finalPrice) > 0.02) {
        throw new Error(
          `Prix incorrect pour ${menuItem.name}: attendu ${verifiedPrice.toFixed(2)}€, reçu ${item.finalPrice.toFixed(2)}€`
        );
      }

      computedTotal += verifiedPrice;
      verifiedItems.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        selectedToppings: item.selectedToppings,
        finalPrice: verifiedPrice,
      });
    }

    // Verify total price (allow tolerance for delivery fee which is validated separately)
    if (Math.abs(computedTotal - args.totalPrice) > 0.02 && args.type === "pickup") {
      throw new Error("Le total de la commande ne correspond pas aux prix du menu.");
    }
    // ── End price validation ──────────────────────────────────────

    const orderId = await ctx.db.insert("orders", {
      userId: sessionUser?.user._id,
      customer: args.customer,
      type: args.type,
      address: args.address,
      scheduledTime: args.scheduledTime,
      paymentMethod: args.paymentMethod,
      paymentStatus: args.paymentStatus,
      stripePaymentIntentId: args.stripePaymentIntentId,
      items: verifiedItems,
      totalPrice: args.type === "pickup" ? computedTotal : args.totalPrice,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return orderId;
  },
});

export const updatePaymentStatus = mutation({
  args: {
    orderId: v.id("orders"),
    paymentStatus: v.union(v.literal("unpaid"), v.literal("paid"), v.literal("failed")),
    stripePaymentIntentId: v.optional(v.string()),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.orderId, {
      paymentStatus: args.paymentStatus,
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: Date.now(),
    });
    return args.orderId;
  },
});

export const addItemToOrder = mutation({
  args: {
    orderId: v.id("orders"),
    adminToken: v.string(),
    item: v.object({
      menuItemId: v.string(),
      name: v.string(),
      price: v.number(),
      selectedSize: v.optional(v.union(
        v.literal("seul"),
        v.literal("frites"),
        v.literal("menu")
      )),
      selectedToppings: v.optional(v.array(v.object({
        categoryId: v.string(),
        toppingIds: v.array(v.string()),
      }))),
      finalPrice: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updatedItems = [...order.items, args.item];
    const newTotal = updatedItems.reduce((sum, item) => sum + item.finalPrice, 0);

    await ctx.db.patch(args.orderId, {
      items: updatedItems,
      totalPrice: newTotal,
      updatedAt: Date.now(),
    });

    return args.orderId;
  },
});

export const removeItemFromOrder = mutation({
  args: {
    orderId: v.id("orders"),
    itemIndex: v.number(),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updatedItems = order.items.filter((_, index) => index !== args.itemIndex);
    const newTotal = updatedItems.reduce((sum, item) => sum + item.finalPrice, 0);

    await ctx.db.patch(args.orderId, {
      items: updatedItems,
      totalPrice: newTotal,
      updatedAt: Date.now(),
    });

    return args.orderId;
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    adminToken: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("delivering"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "completed" && order.paymentMethod === "cash") {
      updates.paymentStatus = "paid";
    }

    await ctx.db.patch(args.orderId, updates);
    return args.orderId;
  },
});

export const clearOrder = mutation({
  args: {
    orderId: v.id("orders"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.patch(args.orderId, {
      items: [],
      totalPrice: 0,
      updatedAt: Date.now(),
    });
    return args.orderId;
  },
});

export const deleteOrder = mutation({
  args: {
    orderId: v.id("orders"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    await ctx.db.delete(args.orderId);
  },
});
