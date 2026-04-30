import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { snapshot } from "./data/snapshot";

export const seedToppingCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const toppingCategories = snapshot?.toppingCategories || [];

    let inserted = 0;
    let skipped = 0;
    for (const category of toppingCategories) {
      // Skip if a category with this categoryId already exists
      const existing = await ctx.db
        .query("toppingCategories")
        .filter((q) => q.eq(q.field("categoryId"), category.categoryId))
        .first();
      if (existing) { skipped++; continue; }
      const { _id, _creationTime, ...rest } = category;
      await ctx.db.insert("toppingCategories", rest);
      inserted++;
    }

    return { success: true, inserted, skipped };
  },
});


export const seedToppings = mutation({
  args: {},
  handler: async (ctx) => {
    const toppings = snapshot?.toppings || [];

    let inserted = 0;
    let skipped = 0;
    for (const topping of toppings) {
      // Skip if a topping with this toppingId already exists
      const existing = await ctx.db
        .query("toppings")
        .filter((q) => q.eq(q.field("toppingId"), topping.toppingId))
        .first();
      if (existing) { skipped++; continue; }
      const { _id, _creationTime, ...rest } = topping;
      await ctx.db.insert("toppings", rest);
      inserted++;
    }

    return { success: true, inserted, skipped };
  },
});


export const seedNewSupplements = mutation({
  args: {},
  handler: async (ctx) => {
    const supplements: any[] = [];

    let inserted = 0;
    let skipped = 0;
    for (let i = 0; i < supplements.length; i++) {
      const topping = supplements[i];
      const existing = await ctx.db
        .query("toppings")
        .withIndex("by_topping_id", (q) => q.eq("toppingId", topping.toppingId))
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert("toppings", {
        ...topping,
        displayOrder: i + 10, // Start after existing ones
        active: true,
      });
      inserted++;
    }

    return { success: true, inserted, skipped };
  },
});



export const seedMenuItems = mutation({
  args: {},
  handler: async (ctx) => {
    const menuItems: any[] = [];

    let inserted = 0;
    let skipped = 0;
    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      // Skip if a menu item with this name already exists
      const existing = await ctx.db
        .query("menuItems")
        .filter((q) => q.eq(q.field("name"), item.name))
        .first();
      if (existing) { skipped++; continue; }
      const { _id, _creationTime, ...rest } = item;
      await ctx.db.insert("menuItems", {
        // @ts-ignore
        ...rest,
        displayOrder: i,
        active: true,
      });
      inserted++;
    }

    return { success: true, inserted, skipped };
  },
});


export const seedMenuItemToppings = mutation({
  args: {},
  handler: async (ctx) => {
    const allMenuItems = await ctx.db.query("menuItems").collect();

    const toppingRules = [
      { categories: ['pizzas-base-tomate', 'pizzas-base-creme', 'pizzas-speciales', 'paninis', 'burgers', 'tex-mex'], toppingCategories: ['sauces', 'crudites', 'supplements'] },
      { categories: ['tacos'], toppingCategories: ['viandes', 'sauces', 'supplements'] },
      { categories: ['salades'], toppingCategories: ['crudites'] },
      { categories: ['bowls', 'kapsalon'], toppingCategories: ['viandes', 'sauces', 'crudites', 'supplements'] },
    ];

    let insertedCount = 0;
    let skippedCount = 0;

    for (const item of allMenuItems) {
      // Skip items that already have topping assignments
      const existingAssignment = await ctx.db
        .query("menuItemToppings")
        .withIndex("by_menu_item", (q) => q.eq("menuItemId", item._id))
        .first();
      if (existingAssignment) { skippedCount++; continue; }

      const rule = toppingRules.find(r => r.categories.some(c => item.categories?.includes(c)));

      if (rule) {
        for (const categoryId of rule.toppingCategories) {
          await ctx.db.insert("menuItemToppings", {
            menuItemId: item._id,
            toppingCategoryId: categoryId,
          });
          insertedCount++;
        }
      } else if (item.categories?.includes('barquettes') && (item.name.includes('Frites') || item.name.includes('Viande') || item.name.includes('Blé'))) {
        await ctx.db.insert("menuItemToppings", {
          menuItemId: item._id,
          toppingCategoryId: 'sauces',
        });
        insertedCount++;
      }
    }

    return { success: true, inserted: insertedCount, skipped: skippedCount };
  },
});


export const seedMenuCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const categories: any[] = [];

    let inserted = 0;
    let skipped = 0;
    for (const category of categories) {
      // Skip if a category with this slug already exists
      const existing = await ctx.db
        .query("menuCategories")
        .withIndex("by_slug", (q) => q.eq("slug", category.slug))
        .first();
      if (existing) { skipped++; continue; }
      const { _id, _creationTime, ...rest } = category;
      await ctx.db.insert("menuCategories", rest);
      inserted++;
    }

    return { success: true, inserted, skipped };
  },
});


export const seedPizzasBaseTomate = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create Category
    const categorySlug = "pizzas-base-tomate";
    const existingCategory = await ctx.db
      .query("menuCategories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();

    if (!existingCategory) {
      await ctx.db.insert("menuCategories", {
        name: "Pizzas Base Tomate",
        slug: categorySlug,
        displayOrder: 0,
        active: true,
      });
    }

    // 2. Add Items
    const items: any[] = [];


    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await ctx.db.insert("menuItems", {
        ...item,
        categories: [categorySlug],
        active: true,
        displayOrder: i,
      });
    }

    return { success: true, count: items.length };
  },
});


export const removePizzaImages = mutation({
  args: {},
  handler: async (ctx) => {
    const categorySlug = "pizzas-base-tomate";
    const items = await ctx.db
      .query("menuItems")
      .collect();

    const pizzaItems = items.filter(item => item.categories?.includes(categorySlug));

    for (const item of pizzaItems) {
      await ctx.db.patch(item._id, {
        image: "",
      });
    }

    return { success: true, count: pizzaItems.length };
  },
});


export const updatePizzaImagesFromFolder = mutation({
  args: {},
  handler: async (ctx) => {
    const categorySlug = "pizzas-base-tomate";
    const items = await ctx.db
      .query("menuItems")
      .collect();

    const pizzaItems = items.filter(item => item.categories?.includes(categorySlug));

    const imageMap: Record<string, string> = {
      'MARGHERITA': '/pizzas/base-tomate/Margherita.jpg',
      'REGINA': '/pizzas/base-tomate/regina.jpg',
      'AU THON': '/pizzas/base-tomate/au-thon.jpg',
      '4 FROMAGES': '/pizzas/base-tomate/4-fromages.jpg',
      'CAMPIONE': '/pizzas/base-tomate/campione.jpg',
      'ORIENTALE': '/pizzas/base-tomate/orientale.jpg',
      'ROYALE': '/pizzas/base-tomate/royale.jpg',
      '4 SAISONS': '/pizzas/base-tomate/4saisons.jpg',
      'VÉGÉTARIENNE': '/pizzas/base-tomate/vegetarienne.jpg',
      'NAPOLITAINE': '/pizzas/base-tomate/napolitaine.jpg',
      '4 JAMBONS': '/pizzas/base-tomate/4jambons.jpg',
      'PEPPERONI': '/pizzas/base-tomate/pepperoni.jpg',
      'KEBAB': '/pizzas/base-tomate/kebab.jpg',
      'CALZONE': '/pizzas/base-tomate/calzone.jpg',
      'FRUITS DE MER': '/pizzas/base-tomate/fruitsdemer.jpg',
      'HAWAÏENNE': '/pizzas/base-tomate/hawaienne.jpg',
    };

    let updated = 0;
    for (const item of pizzaItems) {
      const newImage = imageMap[item.name];
      if (newImage) {
        await ctx.db.patch(item._id, {
          image: newImage,
        });
        updated++;
      }
    }

    return { success: true, updated };
  },
});


export const seedPizzasBaseCreme = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create Category
    const categorySlug = "pizzas-base-creme";
    const existingCategory = await ctx.db
      .query("menuCategories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();

    if (!existingCategory) {
      await ctx.db.insert("menuCategories", {
        name: "Pizzas Base Crème",
        slug: categorySlug,
        displayOrder: 1,
        active: true,
      });
    }

    // 2. Add Items
    const items: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await ctx.db.insert("menuItems", {
        ...item,
        categories: [categorySlug],
        active: true,
        displayOrder: i,
      });
    }

    return { success: true, count: items.length };
  },
});


export const updatePizzaCremeImagesFromFolder = mutation({
  args: {},
  handler: async (ctx) => {
    const categorySlug = "pizzas-base-creme";
    const items = await ctx.db
      .query("menuItems")
      .collect();

    const pizzaItems = items.filter(item => item.categories?.includes(categorySlug));

    const imageMap: Record<string, string> = {
      'SAUMON': '/pizzas/base-creme/saumon.jpg',
      'CHÈVRE MIEL': '/pizzas/base-creme/chevre-miel.jpg',
      'RACLETTE': '/pizzas/base-creme/raclette.jpg',
      'FLAMME': '/pizzas/base-creme/flamme.jpg',
      'CHICKEN': '/pizzas/base-creme/chicken.jpg',
      '4 FROMAGES': '/pizzas/base-creme/4fromages.jpg',
      'FC METZ': '/pizzas/base-creme/fcmetz.jpg',
      'MONDO': '/pizzas/base-creme/mondo.jpg',
    };

    let updated = 0;
    for (const item of pizzaItems) {
      const newImage = imageMap[item.name];
      if (newImage) {
        await ctx.db.patch(item._id, {
          image: newImage,
        });
        updated++;
      }
    }

    return { success: true, updated };
  },
});


export const updateBurgerImagesFromFolder = mutation({

  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("menuItems")
      .collect();


    const imageMap: Record<string, string> = {
      'DOBLE CHEESE': '/burgers/doublecheese.jpg',
      'CHEESEBURGER': '/burgers/cheeseburger.jpg',
      'LE CHICKEN': '/burgers/chicken.jpg',
    };


    let updated = 0;
    for (const item of items) {
      const newImage = imageMap[item.name];
      if (newImage) {
        await ctx.db.patch(item._id, {
          image: newImage,
        });
        updated++;
      }
    }

    return { success: true, updated };
  },
});



export const updateTacoImagesFromFolder = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("menuItems")
      .collect();

    const tacoItems = items.filter(item => item.categories?.includes("tacos"));

    let updated = 0;
    for (const item of tacoItems) {
      await ctx.db.patch(item._id, {
        image: "/tacos/tacos.jpg",
      });
      updated++;
    }

    return { success: true, updated };
  },
});



export const updateTexMexImagesFromFolder = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("menuItems")
      .collect();

    const imageMap: Record<string, string> = {
      'FRITES': '/tex-mex/frites.jpg',
      'POTATOES': '/tex-mex/potatoes.jpg',
      'NUGGETS X8': '/tex-mex/nuggets.jpg',
      'NUGGETS X12': '/tex-mex/nuggets.jpg',
      'CHICKEN WINGS X10': '/tex-mex/wings.jpg',
      'CHICKEN WINGS X12': '/tex-mex/wings.jpg',
    };

    let updated = 0;
    for (const item of items) {
      const newImage = imageMap[item.name];
      if (newImage) {
        await ctx.db.patch(item._id, {
          image: newImage,
        });
        updated++;
      }
    }

    return { success: true, updated };
  },
});


export const seedPizzasSpeciales = mutation({


  args: {},
  handler: async (ctx) => {
    // 1. Create Category
    const categorySlug = "pizzas-speciales";
    const existingCategory = await ctx.db
      .query("menuCategories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();

    if (!existingCategory) {
      await ctx.db.insert("menuCategories", {
        name: "Pizzas Spéciales",
        slug: categorySlug,
        displayOrder: 2, // After base crème
        active: true,
      });
    }

    // 2. Add Items
    const items: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await ctx.db.insert("menuItems", {
        ...item,
        categories: [categorySlug],
        active: true,
        displayOrder: i,
      });
    }

    return { success: true, count: items.length };
  },
});


export const seedPaninis = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create Category
    const categorySlug = "paninis";
    const existingCategory = await ctx.db
      .query("menuCategories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();

    if (!existingCategory) {
      await ctx.db.insert("menuCategories", {
        name: "Paninis",
        slug: categorySlug,
        displayOrder: 3, // After special pizzas
        active: true,
      });
    }

    // 2. Add Items
    const items: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await ctx.db.insert("menuItems", {
        ...item,
        categories: [categorySlug],
        active: true,
        displayOrder: i,
      });
    }

    return { success: true, count: items.length };
  },
});


export const seedBurgers = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create Category
    const categorySlug = "burgers";
    const existingCategory = await ctx.db
      .query("menuCategories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();

    if (!existingCategory) {
      await ctx.db.insert("menuCategories", {
        name: "Burgers",
        slug: categorySlug,
        displayOrder: 4, // After paninis
        active: true,
      });
    }

    // 2. Add Items
    const items: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await ctx.db.insert("menuItems", {
        ...item,
        categories: [categorySlug],
        active: true,
        displayOrder: i,
      });
    }

    return { success: true, count: items.length };
  },
});


export const seedTacos = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create Category
    const categorySlug = "tacos";
    const existingCategory = await ctx.db
      .query("menuCategories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();

    if (!existingCategory) {
      await ctx.db.insert("menuCategories", {
        name: "Tacos",
        slug: categorySlug,
        displayOrder: 5, // After burgers
        active: true,
      });
    }

    // 2. Add Items
    const items: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await ctx.db.insert("menuItems", {
        ...item,
        categories: [categorySlug],
        active: true,
        displayOrder: i,
      });
    }

    return { success: true, count: items.length };
  },
});


export const seedTexMex = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create Category
    const categorySlug = "tex-mex";
    const existingCategory = await ctx.db
      .query("menuCategories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();

    if (!existingCategory) {
      await ctx.db.insert("menuCategories", {
        name: "Tex-Mex",
        slug: categorySlug,
        displayOrder: 6, // After tacos
        active: true,
      });
    }

    // 2. Add Items
    const items: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await ctx.db.insert("menuItems", {
        ...item,
        categories: [categorySlug],
        active: true,
        displayOrder: i,
      });
    }

    return { success: true, count: items.length };
  },
});


export const seedSalades = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create Category
    const categorySlug = "salades";
    const existingCategory = await ctx.db
      .query("menuCategories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();

    if (!existingCategory) {
      await ctx.db.insert("menuCategories", {
        name: "Salades",
        slug: categorySlug,
        displayOrder: 7, // After tex-mex
        active: true,
      });
    }

    // 2. Add Items
    const items: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await ctx.db.insert("menuItems", {
        ...item,
        categories: [categorySlug],
        active: true,
        displayOrder: i,
      });
    }

    return { success: true, count: items.length };
  },
});


export const seedDesserts = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Create Category
    const categorySlug = "desserts";
    const existingCategory = await ctx.db
      .query("menuCategories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();

    if (!existingCategory) {
      await ctx.db.insert("menuCategories", {
        name: "Desserts",
        slug: categorySlug,
        displayOrder: 8, // After salades
        active: true,
      });
    }

    // 2. Add Items
    const items: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await ctx.db.insert("menuItems", {
        ...item,
        categories: [categorySlug],
        active: true,
        displayOrder: i,
      });
    }

    return { success: true, count: items.length };
  },
});


export const seedBoissons = mutation({
  args: {},
  handler: async (ctx) => {
    const categorySlug = "boissons";
    console.log("Updating Boissons category with new items...");
    
    // 1. Get current boissons to delete them
    const existingBoissons = await ctx.db
      .query("menuItems")
      .collect();

    // Filter items that actually contain 'boissons' in their categories array
    const toDelete = existingBoissons.filter(item => item.categories && item.categories.includes(categorySlug));

    for (const item of toDelete) {
      await ctx.db.delete(item._id);
    }

    const newBoissons = [
      { name: "Fanta Orange", price: 2.30, description: "33cl", popular: false },
      { name: "Coca-Cola Cherry", price: 2.30, description: "33cl", popular: true },
      { name: "Orangina", price: 2.30, description: "33cl", popular: false },
      { name: "Perrier", price: 2.30, description: "33cl", popular: false },
      { name: "7 Up", price: 2.30, description: "33cl", popular: false },
      { name: "Schweppes Agrumes", price: 2.30, description: "33cl", popular: false },
      { name: "Sprite", price: 2.30, description: "33cl", popular: false },
      { name: "Red Bull", price: 3.50, description: "33cl", popular: false },
      { name: "Coca Cola 1.5L", price: 4.50, description: "1.5L", popular: true },
      { name: "Fanta Orange 1.5L", price: 4.50, description: "1.5L", popular: false },
      { name: "Monster Energy 50cl", price: 3.50, description: "50cl", popular: false },
      { name: "Coca-Cola", price: 2.30, description: "33cl", popular: true },
      { name: "Coca-Cola Zéro", price: 2.30, description: "33cl", popular: true },
      { name: "Ice Tea", price: 2.30, description: "33cl", popular: false },
      { name: "Oasis", price: 2.30, description: "33cl", popular: false },
      { name: "Eau Minérale", price: 2.30, description: "33cl", popular: false },
      { name: "Dada", price: 2.30, description: "33cl", popular: false },
      { name: "Ice Tea 1.5L", price: 4.50, description: "1.5L", popular: false },
      { name: "Oasis 2L", price: 5.00, description: "2L", popular: false },
    ];

    let inserted = 0;
    for (let i = 0; i < newBoissons.length; i++) {
      const b = newBoissons[i];
      await ctx.db.insert("menuItems", {
        name: b.name,
        price: b.price,
        description: b.description,
        popular: b.popular,
        categories: [categorySlug],
        active: true,
        displayOrder: 100 + i, // High order to keep them together
        image: "",
        categoryOrders: []
      });
      inserted++;
    }

    return { success: true, deleted: toDelete.length, inserted };
  },
});


export const seedRestaurantInfo = mutation({
  args: {},
  handler: async (ctx) => {
    // Skip if restaurant info already exists
    const existing = await ctx.db
      .query("restaurantInfo")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (existing) return { success: true, skipped: true };


    await ctx.db.insert("restaurantInfo", {
      key: "main",
      address: "",
      phone: "",
      email: "",

      hours: [
        { day: 'Lundi', time: '11h00 - 14h00 et 17h30 - 23h00' },
        { day: 'Mardi', time: '11h00 - 14h00 et 17h30 - 23h00' },
        { day: 'Mercredi', time: '11h00 - 14h00 et 17h30 - 23h00' },
        { day: 'Jeudi', time: '11h00 - 14h00 et 17h30 - 23h00' },
        { day: 'Vendredi', time: '11h00 - 14h00 et 17h30 - 23h00' },
        { day: 'Samedi', time: '17h30 - 23h00' },
        { day: 'Dimanche', time: '17h30 - 23h00' },
      ],

      socialLinks: {

        facebook: "",
        instagram: "",
        twitter: "",
      },
    });
    return { success: true, skipped: false };
  },
});




export const seedReviews = mutation({


  args: {},
  handler: async (ctx) => {
    const reviews: any[] = [];

    let inserted = 0;
    let skipped = 0;
    for (const review of reviews) {
      // Skip if a review by this person on this date already exists
      const existing = await ctx.db
        .query("reviews")
        .filter((q) => q.and(
          q.eq(q.field("name"), review.name),
          q.eq(q.field("date"), review.date)
        ))
        .first();
      if (existing) { skipped++; continue; }
      await ctx.db.insert("reviews", review);
      inserted++;
    }

    return { success: true, inserted, skipped };
  },
});


export const seedGallery = mutation({
  args: {},
  handler: async (ctx) => {
    const images: any[] = [];

    let inserted = 0;
    let skipped = 0;
    for (const image of images) {
      // Skip if a gallery item with this title already exists
      const existing = await ctx.db
        .query("gallery")
        .filter((q) => q.eq(q.field("title"), image.title))
        .first();
      if (existing) { skipped++; continue; }
      await ctx.db.insert("gallery", image);
      inserted++;
    }
    return { success: true, inserted, skipped };

  },
});

// Admin user creation - password must be provided via Convex Dashboard or CLI
// Example: npx convex run seed:createAdminUser '{"username":"admin","password":"your-secure-password"}'
export const createAdminUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUser) {
      throw new Error(`Admin user '${args.username}' already exists`);
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(args.password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    await ctx.db.insert("adminUsers", {
      username: args.username,
      passwordHash,
      createdAt: Date.now(),
    });

    return { success: true, username: args.username };
  },
});

export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const menuItems = await ctx.db.query("menuItems").collect();
    for (const item of menuItems) {
      await ctx.db.delete(item._id);
    }

    const toppings = await ctx.db.query("toppings").collect();
    for (const topping of toppings) {
      await ctx.db.delete(topping._id);
    }

    const categories = await ctx.db.query("toppingCategories").collect();
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }

    const assignments = await ctx.db.query("menuItemToppings").collect();
    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }

    const menuCategories = await ctx.db.query("menuCategories").collect();
    for (const category of menuCategories) {
      await ctx.db.delete(category._id);
    }

    const restaurantInfo = await ctx.db.query("restaurantInfo").collect();
    for (const info of restaurantInfo) {
      await ctx.db.delete(info._id);
    }

    return { success: true };
  },
});

export const cleanupOrphanedToppings = mutation({
  args: {},
  handler: async (ctx) => {
    const toppings = await ctx.db.query("toppings").collect();
    const categories = await ctx.db.query("toppingCategories").collect();
    const categoryIds = new Set(categories.map((c) => c.categoryId));

    let deletedCount = 0;
    for (const topping of toppings) {
      if (!categoryIds.has(topping.categoryId)) {
        await ctx.db.delete(topping._id);
        deletedCount++;
      }
    }

    const assignments = await ctx.db.query("menuItemToppings").collect();
    let deletedAssignments = 0;
    for (const assignment of assignments) {
      if (!categoryIds.has(assignment.toppingCategoryId)) {
        await ctx.db.delete(assignment._id);
        deletedAssignments++;
      }
    }

    return { success: true, deletedCount, deletedAssignments };
  },
});

export const restart = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "menuItems", "toppings", "toppingCategories",
      "menuItemToppings", "menuCategories", "restaurantInfo",
      "reviews", "gallery", "orders", "users", "adminUsers"
    ] as const;

    for (const table of tables) {
      const items = await ctx.db.query(table as any).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
    }

    const data = snapshot;
    const idMap: Record<string, any> = {};

    // 1. Insert Menu Categories
    if (data.menuCategories) {
      for (const item of data.menuCategories) {
        const { _id, _creationTime, ...rest } = item;
        const newId = await ctx.db.insert("menuCategories", rest);
        if (_id) idMap[_id] = newId;
      }
    }

    // 2. Insert Topping Categories
    if (data.toppingCategories) {
      for (const item of data.toppingCategories) {
        const { _id, _creationTime, ...rest } = item;
        const newId = await ctx.db.insert("toppingCategories", rest);
        if (_id) idMap[_id] = newId;
      }
    }

    // 3. Insert Menu Items
    if (data.menuItems) {
      for (const item of data.menuItems) {
        const { _id, _creationTime, ...rest } = item;
        const newId = await ctx.db.insert("menuItems", rest);
        if (_id) idMap[_id] = newId;
      }
    }

    // 4. Insert Toppings (may have menuItemId)
    if (data.toppings) {
      for (const item of data.toppings) {
        const { _id, _creationTime, ...rest } = item;
        if (rest.menuItemId && idMap[rest.menuItemId]) {
          rest.menuItemId = idMap[rest.menuItemId];
        } else if (rest.menuItemId) {
          delete rest.menuItemId; // ID mismatch, better to delete than fail
        }
        await ctx.db.insert("toppings", rest);
      }
    }

    // 5. Insert MenuItemToppings (has menuItemId)
    if (data.menuItemToppings) {
      for (const item of data.menuItemToppings) {
        const { _id, _creationTime, ...rest } = item;
        if (rest.menuItemId && idMap[rest.menuItemId]) {
          rest.menuItemId = idMap[rest.menuItemId];
          await ctx.db.insert("menuItemToppings", rest);
        }
      }
    }

    // 6. Insert Restaurant Info
    if (data.restaurantInfo) {
      for (const item of data.restaurantInfo) {
        const { _id, _creationTime, ...rest } = item;
        await ctx.db.insert("restaurantInfo", rest);
      }
    }

    // 7. Insert Reviews
    if (data.reviews) {
      for (const item of data.reviews) {
        const { _id, _creationTime, ...rest } = item;
        // Reviews might reference users or orders, but we clear those
        delete rest.userId;
        delete rest.orderId;
        await ctx.db.insert("reviews", rest);
      }
    }

    // 8. Insert Gallery
    if (data.gallery) {
      for (const item of data.gallery) {
        const { _id, _creationTime, ...rest } = item;
        await ctx.db.insert("gallery", rest);
      }
    }

    return { success: true };
  },
});


export const seedFromSnapshot = mutation({

  args: {
    data: v.any(),
    clearFirst: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.clearFirst) {
      const tables = [
        "menuItems", "toppings", "toppingCategories",
        "menuItemToppings", "menuCategories", "restaurantInfo",
        "reviews", "gallery"
      ] as const;

      for (const table of tables) {
        const items = await ctx.db.query(table).collect();
        for (const item of items) {
          await ctx.db.delete(item._id);
        }
      }
    }

    const { data } = args;

    const insertItems = async (table: any, items: any[]) => {
      if (!items) return;
      for (const item of items) {
        const { _id, _creationTime, ...rest } = item;
        // Check if item already exists by name/slug to avoid duplicates if not clearing
        if (table === "menuItems") {
          const existing = await ctx.db.query("menuItems").filter(q => q.eq(q.field("name"), rest.name)).first();
          if (existing) continue;
        } else if (table === "menuCategories") {
          const existing = await ctx.db.query("menuCategories").withIndex("by_slug", q => q.eq("slug", rest.slug)).first();
          if (existing) continue;
        }

        await ctx.db.insert(table, rest);
      }
    };

    await insertItems("menuCategories", data.menuCategories);
    await insertItems("toppingCategories", data.toppingCategories);
    await insertItems("toppings", data.toppings);
    await insertItems("menuItems", data.menuItems);
    await insertItems("menuItemToppings", data.menuItemToppings);
    await insertItems("restaurantInfo", data.restaurantInfo);
    await insertItems("reviews", data.reviews);
    await insertItems("gallery", data.gallery);

    return { success: true };
  },
});

/**
 * Exports all relevant menu data from the database.
 */
export const exportData = mutation({
  args: {},
  handler: async (ctx) => {
    const menuCategories = await ctx.db.query("menuCategories").collect();
    const menuItems = await ctx.db.query("menuItems").collect();
    const toppingCategories = await ctx.db.query("toppingCategories").collect();
    const toppings = await ctx.db.query("toppings").collect();
    const menuItemToppings = await ctx.db.query("menuItemToppings").collect();
    const restaurantInfo = await ctx.db.query("restaurantInfo").collect();
    const reviews = await ctx.db.query("reviews").collect();
    const gallery = await ctx.db.query("gallery").collect();

    return {
      menuCategories,
      menuItems,
      toppingCategories,
      toppings,
      menuItemToppings,
      restaurantInfo,
      reviews,
      gallery,
    };
  },
});

/**
 * Imports data into the database, optionally clearing existing data.
 */
export const importData = mutation({
  args: {
    data: v.any(), // The result from exportData
    clearFirst: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.clearFirst) {
      const tables = [
        "menuItems", "toppings", "toppingCategories",
        "menuItemToppings", "menuCategories", "restaurantInfo",
        "reviews", "gallery"
      ] as const;

      for (const table of tables) {
        const items = await ctx.db.query(table).collect();
        for (const item of items) {
          await ctx.db.delete(item._id);
        }
      }
    }

    const { data } = args;

    const insertItems = async (table: any, items: any[]) => {
      if (!items) return;
      for (const item of items) {
        const { _id, _creationTime, ...rest } = item;
        await ctx.db.insert(table, rest);
      }
    };

    await insertItems("menuCategories", data.menuCategories);
    await insertItems("toppingCategories", data.toppingCategories);
    await insertItems("toppings", data.toppings);
    await insertItems("menuItems", data.menuItems);
    await insertItems("menuItemToppings", data.menuItemToppings);
    await insertItems("restaurantInfo", data.restaurantInfo);
    await insertItems("reviews", data.reviews);
    await insertItems("gallery", data.gallery);

    return { success: true };
  },
});




