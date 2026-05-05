import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  createAdminSession,
  createUserSession,
  hashPassword,
  maybeGetAdminFromSession,
  maybeGetUserFromSession,
  requireAdminSession,
  requireUserSession,
  revokeAdminSession,
  revokeUserSession,
  verifyPassword,
} from "./lib/auth";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findUserByEmail(ctx: any, email: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", email))
    .first() ?? null;
}

async function assertAdminOrSelf(
  ctx: any,
  args: { id: any; adminToken?: string; sessionToken?: string },
) {
  if (args.adminToken) {
    await requireAdminSession(ctx, args.adminToken);
    return;
  }

  if (!args.sessionToken) {
    throw new Error("Unauthorized");
  }

  const { user } = await requireUserSession(ctx, args.sessionToken);
  if (user._id !== args.id) {
    throw new Error("Unauthorized");
  }
}

export const createAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    bootstrapSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requiredSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (requiredSecret) {
      if (args.bootstrapSecret !== requiredSecret) {
        throw new Error("Unauthorized");
      }
    }

    const existingAdmins = await ctx.db.query("adminUsers").collect();
    if (existingAdmins.length > 0) {
      throw new Error("Admin user is already initialized");
    }

    const passwordHash = await hashPassword(args.password);
    const adminId = await ctx.db.insert("adminUsers", {
      username: args.username,
      passwordHash,
      createdAt: Date.now(),
      role: "admin",
    });

    return adminId;
  },
});

export const verifyAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("adminUsers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!admin) {
      return null;
    }

    const passwordState = await verifyPassword(args.password, admin.passwordHash);
    if (!passwordState.valid) {
      return null;
    }

    if (passwordState.upgradedHash) {
      await ctx.db.patch(admin._id, {
        passwordHash: passwordState.upgradedHash,
      });
    }

    const sessionToken = await createAdminSession(ctx, admin._id);

    return {
      id: admin._id,
      username: admin.username,
      role: admin.role ?? "admin",
      sessionToken,
    };
  },
});

export const logoutAdmin = mutation({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    await revokeAdminSession(ctx, args.sessionToken);
    return true;
  },
});

export const getCurrentAdmin = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await maybeGetAdminFromSession(ctx, args.sessionToken);
    if (!admin) {
      return null;
    }

    return {
      id: admin._id,
      username: admin.username,
      role: admin.role ?? "admin",
    };
  },
});

export const listAdminUsers = query({
  args: { adminToken: v.string() },
  handler: async (ctx, args) => {
    const { admin } = await requireAdminSession(ctx, args.adminToken);
    if (admin.role && admin.role !== "admin") throw new Error("Unauthorized");

    const admins = await ctx.db.query("adminUsers").collect();
    return admins.map((a) => ({
      _id: a._id,
      username: a.username,
      role: a.role ?? "admin",
      createdAt: a.createdAt,
    }));
  },
});

export const createAdminUser = mutation({
  args: {
    adminToken: v.string(),
    username: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("orders_manager")),
  },
  handler: async (ctx, args) => {
    const { admin } = await requireAdminSession(ctx, args.adminToken);
    if (admin.role && admin.role !== "admin") throw new Error("Unauthorized");

    if (args.password.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères.");

    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    if (existing) throw new Error("Ce nom d'utilisateur est déjà pris.");

    const passwordHash = await hashPassword(args.password);
    await ctx.db.insert("adminUsers", {
      username: args.username,
      passwordHash,
      createdAt: Date.now(),
      role: args.role,
    });
  },
});

export const deleteAdminUser = mutation({
  args: {
    adminToken: v.string(),
    targetId: v.id("adminUsers"),
  },
  handler: async (ctx, args) => {
    const { admin } = await requireAdminSession(ctx, args.adminToken);
    if (admin.role && admin.role !== "admin") throw new Error("Unauthorized");
    if (admin._id === args.targetId) throw new Error("Impossible de supprimer votre propre compte.");

    const sessions = await ctx.db
      .query("adminSessions")
      .withIndex("by_admin", (q) => q.eq("adminId", args.targetId))
      .collect();
    for (const session of sessions) await ctx.db.delete(session._id);

    await ctx.db.delete(args.targetId);
  },
});

export const updateAdminPassword = mutation({
  args: {
    adminToken: v.string(),
    targetId: v.id("adminUsers"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const { admin } = await requireAdminSession(ctx, args.adminToken);
    if (admin.role && admin.role !== "admin") throw new Error("Unauthorized");

    if (args.newPassword.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères.");

    const passwordHash = await hashPassword(args.newPassword);
    await ctx.db.patch(args.targetId, { passwordHash });
  },
});

export const signupUser = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Input validation
    if (args.password.length < 8) {
      throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
    }

    if (args.firstName.trim().length === 0 || args.firstName.length > 100) {
      throw new Error("Prénom invalide.");
    }

    if (args.lastName.trim().length === 0 || args.lastName.length > 100) {
      throw new Error("Nom invalide.");
    }

    if (args.phone.length > 20) throw new Error("Numéro de téléphone invalide.");
    if ((args.street ?? "").length > 200) throw new Error("Adresse trop longue.");
    if ((args.city ?? "").length > 100) throw new Error("Ville trop longue.");
    if ((args.zipCode ?? "").length > 10) throw new Error("Code postal invalide.");

    const email = normalizeEmail(args.email);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Adresse email invalide.");
    }

    const existing = await findUserByEmail(ctx, email);

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      firstName: args.firstName,
      lastName: args.lastName,
      email,
      phone: args.phone,
      street: args.street,
      city: args.city,
      zipCode: args.zipCode,
      passwordHash,
      createdAt: Date.now(),
    });

    const sessionToken = await createUserSession(ctx, userId);

    return {
      id: userId,
      firstName: args.firstName,
      lastName: args.lastName,
      email,
      phone: args.phone,
      street: args.street,
      city: args.city,
      zipCode: args.zipCode,
      sessionToken,
    };
  },
});

export const verifyUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);

    const user = await findUserByEmail(ctx, email);

    if (!user) {
      return null;
    }

    const passwordState = await verifyPassword(args.password, user.passwordHash);
    if (!passwordState.valid) {
      return null;
    }

    if (passwordState.upgradedHash) {
      await ctx.db.patch(user._id, {
        passwordHash: passwordState.upgradedHash,
      });
    }

    const sessionToken = await createUserSession(ctx, user._id);

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      street: user.street,
      city: user.city,
      zipCode: user.zipCode,
      sessionToken,
    };
  },
});

export const logoutUser = mutation({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    await revokeUserSession(ctx, args.sessionToken);
    return true;
  },
});

export const getCurrentUser = query({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await maybeGetUserFromSession(ctx, args.sessionToken);
    if (!user) {
      return null;
    }

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      street: user.street,
      city: user.city,
      zipCode: user.zipCode,
    };
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
    adminToken: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.adminToken) {
      await requireAdminSession(ctx, args.adminToken);
    } else if (args.sessionToken) {
      const { user } = await requireUserSession(ctx, args.sessionToken);
      if (user._id !== args.userId) {
        throw new Error("Unauthorized");
      }
    } else {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      street: user.street,
      city: user.city,
      zipCode: user.zipCode,
      createdAt: user.createdAt,
    };
  },
});

export const listAllUsers = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    const users = await ctx.db.query("users").order("desc").collect();

    const usersWithOrderCounts = await Promise.all(
      users.map(async (user) => {
        const orderCount = (
          await ctx.db
            .query("orders")
            .filter((q) =>
              q.and(
                q.eq(q.field("userId"), user._id),
                q.neq(q.field("status"), "awaiting_payment"),
              ),
            )
            .collect()
        ).length;

        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          street: user.street,
          city: user.city,
          zipCode: user.zipCode,
          createdAt: user.createdAt,
          orderCount,
        };
      }),
    );

    return usersWithOrderCounts;
  },
});

export const listUserOrders = query({
  args: {
    userId: v.id("users"),
    adminToken: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.adminToken) {
      await requireAdminSession(ctx, args.adminToken);
    } else if (args.sessionToken) {
      const { user } = await requireUserSession(ctx, args.sessionToken);
      if (user._id !== args.userId) {
        throw new Error("Unauthorized");
      }
    } else {
      throw new Error("Unauthorized");
    }

    const orders = (
      await ctx.db
        .query("orders")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .order("desc")
        .collect()
    ).filter((o) => o.status !== "awaiting_payment");

    // Enrich orders with topping names
    return await Promise.all(orders.map(async (order) => {
      const enrichedItems = await Promise.all(order.items.map(async (item) => {
        if (!item.selectedToppings) return item;

        const enrichedToppings = await Promise.all(item.selectedToppings.map(async (toppingGroup) => {
          const toppingDetails = await Promise.all(toppingGroup.toppingIds.map(async (id) => {
            const topping = await ctx.db.query("toppings").filter(q => q.eq(q.field("toppingId"), id)).first();
            if (topping) {
              return { name: topping.name, price: topping.price ?? 0 };
            }
            return { name: id, price: 0 };
          }));
          return {
            ...toppingGroup,
            toppingNames: toppingDetails.map(t => t.name),
            toppingPrices: toppingDetails.map(t => t.price),
          };
        }));

        return { ...item, selectedToppings: enrichedToppings };
      }));
      return { ...order, items: enrichedItems };
    }));
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    adminToken: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertAdminOrSelf(ctx, args);

    const email = normalizeEmail(args.email);
    const existingByEmail = await findUserByEmail(ctx, email);

    if (existingByEmail && existingByEmail._id !== args.id) {
      throw new Error("User with this email already exists");
    }

    const { id, adminToken, sessionToken, ...rest } = args;
    await ctx.db.patch(id, {
      ...rest,
      email,
    });
  },
});

export const removeUser = mutation({
  args: {
    id: v.id("users"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    const sessions = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    await ctx.db.delete(args.id);
  },
});
