import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { MutationCtx } from "./_generated/server";
import { hashPassword, requireAdminSession } from "./lib/auth";

// Internal helper functions
async function runSeedCategories(ctx: MutationCtx) {
  const categories = [
    { name: "Pizzas Base Tomate", slug: "pizzas-base-tomate", displayOrder: 0, active: true },
    { name: "Pizzas Base Crème", slug: "pizzas-base-creme", displayOrder: 1, active: true },
    { name: "Pizzas Spéciales", slug: "pizzas-speciales", displayOrder: 2, active: true },
    { name: "Paninis", slug: "paninis", displayOrder: 3, active: true },
    { name: "Burgers", slug: "burgers", displayOrder: 4, active: true },
    { name: "Tacos", slug: "tacos", displayOrder: 5, active: true },
    { name: "Tex-Mex", slug: "tex-mex", displayOrder: 6, active: true },
    { name: "Salades", slug: "salades", displayOrder: 7, active: true },
    { name: "Desserts", slug: "desserts", displayOrder: 8, active: true },
    { name: "Boissons", slug: "boissons", displayOrder: 9, active: true },
  ];

  for (const cat of categories) {
    await ctx.db.insert("menuCategories", cat);
  }
}

async function runSeedToppingCategories(ctx: MutationCtx) {
  const categories = [
    { categoryId: "sauces", name: "Sauces", minSelection: 0, maxSelection: 3, displayOrder: 3, active: true },
    { categoryId: "crudites", name: "Crudités", minSelection: 0, maxSelection: 4, displayOrder: 4, active: true },
    { categoryId: "supplements", name: "Suppléments", minSelection: 0, maxSelection: 10, displayOrder: 5, active: true },
    { categoryId: "viandes", name: "1 Viandes", minSelection: 1, maxSelection: 1, displayOrder: 1, active: true },
    { categoryId: "2-viandes", name: "2 Vaindes", minSelection: 1, maxSelection: 2, displayOrder: 2, active: true },
    { categoryId: "taille", name: "Taille Pizza", minSelection: 0, maxSelection: 1, displayOrder: 0, active: true, freeForBogo: true },
  ];

  for (const cat of categories) {
    await ctx.db.insert("toppingCategories", cat);
  }
}

async function runSeedToppings(ctx: MutationCtx) {
  const toppings = [
    { toppingId: "sauce-blanche", name: "Sauce Blanche", price: 0, categoryId: "sauces", displayOrder: 0, active: true },
    { toppingId: "sauce-andalouse", name: "Sauce Andalouse", price: 0, categoryId: "sauces", displayOrder: 1, active: true },
    { toppingId: "salade", name: "Salade", price: 0, categoryId: "crudites", displayOrder: 11, active: true },
    { toppingId: "tomate", name: "Tomate", price: 0, categoryId: "crudites", displayOrder: 12, active: true },
    { toppingId: "oignon", name: "Oignon", price: 0, categoryId: "crudites", displayOrder: 13, active: true },
    { toppingId: "chou-rouge", name: "Chou Rouge", price: 0, categoryId: "crudites", displayOrder: 14, active: true },
    { toppingId: "mais", name: "Maïs", price: 0, categoryId: "crudites", displayOrder: 15, active: true },
    { toppingId: "olives-noires", name: "Olives Noires", price: 0, categoryId: "crudites", displayOrder: 16, active: true },
    { toppingId: "mozzarella-extra", name: "Extra Mozzarella", price: 1.5, categoryId: "supplements", displayOrder: 17, active: true },
    { toppingId: "cheddar", name: "Cheddar", price: 1, categoryId: "supplements", displayOrder: 18, active: true },
    { toppingId: "feta", name: "Feta", price: 1.5, categoryId: "supplements", displayOrder: 19, active: true },
    { toppingId: "chevre", name: "Chèvre", price: 1.5, categoryId: "supplements", displayOrder: 20, active: true },
    { toppingId: "brie", name: "Brie", price: 1.5, categoryId: "supplements", displayOrder: 21, active: true },
    { toppingId: "gorgonzola", name: "Gorgonzola", price: 1.5, categoryId: "supplements", displayOrder: 22, active: true },
    { toppingId: "raclette", name: "Raclette", price: 1.5, categoryId: "supplements", displayOrder: 23, active: true },
    { toppingId: "reblochon", name: "Reblochon", price: 1.5, categoryId: "supplements", displayOrder: 24, active: true },
    { toppingId: "champignons", name: "Champignons", price: 1, categoryId: "supplements", displayOrder: 25, active: true },
    { toppingId: "poivrons", name: "Poivrons", price: 1, categoryId: "supplements", displayOrder: 26, active: true },
    { toppingId: "oignons-pizza", name: "Oignons", price: 1, categoryId: "supplements", displayOrder: 27, active: true },
    { toppingId: "olives-pizza", name: "Olives", price: 1, categoryId: "supplements", displayOrder: 28, active: true },
    { toppingId: "oeuf", name: "Oeuf", price: 1, categoryId: "supplements", displayOrder: 29, active: true },
    { toppingId: "pomme-de-terre", name: "Pomme de Terre", price: 1, categoryId: "supplements", displayOrder: 30, active: true },
    { toppingId: "ananas", name: "Ananas", price: 1, categoryId: "supplements", displayOrder: 31, active: true },
    { toppingId: "miel", name: "Miel", price: 0.5, categoryId: "supplements", displayOrder: 32, active: true },
    { toppingId: "poulet", name: "Escalope de Poulet", price: 0, categoryId: "viandes", displayOrder: 34, active: true },
    { toppingId: "viande-hachee", name: "Steak", price: 0, categoryId: "viandes", displayOrder: 33, active: true },
    { toppingId: "merguez", name: "Poulet Tandoori", price: 0, categoryId: "viandes", displayOrder: 35, active: true },
    { toppingId: "kebab-topping", name: "Chicken Chika", price: 0, categoryId: "viandes", displayOrder: 36, active: true },
    { toppingId: "jambon", name: "Viande Kebab", price: 0, categoryId: "viandes", displayOrder: 37, active: true },
    { toppingId: "lardons", name: "Cordon Bleu", price: 0, categoryId: "viandes", displayOrder: 38, active: true },
    { toppingId: "bacon", name: "Tenders", price: 0, categoryId: "viandes", displayOrder: 39, active: true },
    { toppingId: "pepperoni", name: "Nuggets", price: 0, categoryId: "viandes", displayOrder: 40, active: true },
    { toppingId: "topping-1777547095472", name: "Steak", price: 0, categoryId: "2-viandes", displayOrder: 32, active: true },
    { toppingId: "topping-1777547112484", name: "Escalope de Poulet", price: 0, categoryId: "2-viandes", displayOrder: 33, active: true },
    { toppingId: "topping-1777547122429", name: "Poulet Tandoori", price: 0, categoryId: "2-viandes", displayOrder: 34, active: true },
    { toppingId: "topping-1777547130221", name: "Chicken Chika", price: 0, categoryId: "2-viandes", displayOrder: 35, active: true },
    { toppingId: "topping-1777547142493", name: "Viande Kebab", price: 0, categoryId: "2-viandes", displayOrder: 36, active: true },
    { toppingId: "topping-1777547159751", name: "Cordon Bleu", price: 0, categoryId: "2-viandes", displayOrder: 37, active: true },
    { toppingId: "topping-1777547171719", name: "Tenders", price: 0, categoryId: "2-viandes", displayOrder: 38, active: true },
    { toppingId: "topping-1777547187042", name: "Nuggets", price: 0, categoryId: "2-viandes", displayOrder: 39, active: true },
    { toppingId: "topping-1777548068398", name: "33 CM", price: 3, categoryId: "taille", displayOrder: 41, active: true },
    { toppingId: "topping-1777548084889", name: "29 CM", price: 0, categoryId: "taille", displayOrder: 40, active: true },
  ];

  for (const topping of toppings) {
    await ctx.db.insert("toppings", topping);
  }
}

async function runSeedMenuItems(ctx: MutationCtx) {
  const items = [
    { name: "MARGHERITA", description: "Sauce tomate, mozzarella", price: 8.5, image: "/pizzas/base-tomate/Margherita.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 0, inStock: true },
    { name: "REGINA", description: "Sauce tomate, mozzarella, champignons, jambon", price: 10, image: "/pizzas/base-tomate/regina.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 1, inStock: true },
    { name: "THON", description: "Sauce tomate, mozzarella, thon, oignon, poivron, olive noire", price: 10, image: "/pizzas/base-tomate/au-thon.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 2, inStock: true },
    { name: "4 FROMAGES", description: "Sauce tomate, mozzarella, brie, chèvre, gorgonzola", price: 10, image: "/pizzas/base-tomate/4-fromages.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 3, inStock: true },
    { name: "CAMPIONE", description: "Sauce tomate, mozzarella, viande hachée, champignons", price: 10, image: "/pizzas/base-tomate/campione.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 4, inStock: true },
    { name: "ORIENTALE", description: "Sauce tomate, mozzarella, merguez, poivron, olives noires, oignon, oeuf", price: 10, image: "/pizzas/base-tomate/orientale.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 5, inStock: true },
    { name: "ROYALE", description: "Sauce tomate, mozzarella, merguez, viande hachée, poulet", price: 10, image: "/pizzas/base-tomate/royale.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 6, inStock: true },
    { name: "VÉGÉTARIENNE", description: "Sauce tomate, mozzarella, champignons, poivron, artichaut, aubergine, olives noires", price: 10, image: "/pizzas/base-tomate/vegetarienne.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 8, inStock: true },
    { name: "NAPOLITAINE", description: "Sauce tomate, mozzarella, anchois, câpre, olives noires", price: 10, image: "/pizzas/base-tomate/napolitaine.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 9, inStock: true },
    { name: "4 JAMBONS", description: "Sauce tomate, mozzarella, jambon, lardons, bacon, pepperoni", price: 11.5, image: "/pizzas/base-tomate/4jambons.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 10, inStock: true },
    { name: "PEPPERONI", description: "Sauce tomate, mozzarella, pepperoni, oeuf", price: 10, image: "/pizzas/base-tomate/pepperoni.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 11, inStock: true },
    { name: "KEBAB", description: "Sauce tomate, mozzarella, viande kebab, oignon, olives noires", price: 10, image: "/pizzas/base-tomate/kebab.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 12, inStock: true },
    { name: "CALZONE", description: "Sauce tomate, mozzarella, champignons, jaune d'oeuf, jambon ou viande hachée ou poulet ou thon", price: 13.5, image: "/pizzas/base-tomate/calzone.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 13, inStock: false },
    { name: "FRUITS DE MER", description: "Sauce tomate, mozzarella, cocktail de fruits de mer", price: 10, image: "/pizzas/base-tomate/fruitsdemer.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 14, inStock: true },
    { name: "HAWAÏENNE", description: "Sauce tomate, mozzarella, jambon, ananas, maïs", price: 10, image: "/pizzas/base-tomate/hawaienne.jpg", categories: ["pizzas-base-tomate"], active: true, displayOrder: 15, inStock: true },
    { name: "SAUMON", description: "Base crème, mozzarella, saumon, pomme de terre, oignon", price: 11.5, image: "/pizzas/base-creme/saumon.jpg", categories: ["pizzas-base-creme"], active: true, displayOrder: 0, inStock: true },
    { name: "CHÈVRE MIEL", description: "Base crème, mozzarella, chèvre, miel", price: 10, image: "/pizzas/base-creme/chevre-miel.jpg", categories: ["pizzas-base-creme"], active: true, displayOrder: 1, inStock: true },
    { name: "RACLETTE", description: "Base crème, mozzarella, jambon, pomme de terre, raclette", price: 10, image: "/pizzas/base-creme/raclette.jpg", categories: ["pizzas-base-creme"], active: true, displayOrder: 2, inStock: true },
    { name: "FLAMME", description: "Base crème, mozzarella, lardons, oignon", price: 10, image: "/pizzas/base-creme/flamme.jpg", categories: ["pizzas-base-creme"], active: true, displayOrder: 3, inStock: true },
    { name: "CHICKEN", description: "Base crème, mozzarella, poulet, oignon, champignons, poivron", price: 10, image: "/pizzas/base-creme/chicken.jpg", categories: ["pizzas-base-creme"], active: true, displayOrder: 4, inStock: true },
    { name: "4 FROMAGES", description: "Base crème, mozzarella, brie, chèvre, gorgonzola", price: 10, image: "/pizzas/base-creme/4fromages.jpg", categories: ["pizzas-base-creme"], active: true, displayOrder: 5, inStock: true },
    { name: "FC METZ", description: "Base crème, viande hachée, pommes de terre, boursin", price: 10, image: "/pizzas/base-creme/fcmetz.jpg", categories: ["pizzas-base-creme"], active: true, displayOrder: 6, inStock: true },
    { name: "MONDO", description: "Base crème, mozzarella, jambon, pomme de terre, champignons, reblochon, oignons", price: 10, image: "/pizzas/base-creme/mondo.jpg", categories: ["pizzas-base-creme"], active: true, displayOrder: 7, inStock: true },
    { name: "ALGÉRIENNE", description: "Sauce algérienne, mozzarella, viande hachée, pomme de terre, poivron, olives noires", price: 10, image: "/pizzas/pizzaicon.jpg", categories: ["pizzas-speciales"], active: true, displayOrder: 0, inStock: true },
    { name: "INDIENNE", description: "Sauce curry, mozzarella, poulet, oignon, poivron", price: 10, image: "/pizzas/pizzaicon.jpg", categories: ["pizzas-speciales"], active: true, displayOrder: 1, inStock: true },
    { name: "ANDALOUSE", description: "Sauce andalouse, mozzarella, poulet, oignon, poivron, chèvre", price: 10, image: "/pizzas/pizzaicon.jpg", categories: ["pizzas-speciales"], active: true, displayOrder: 2, inStock: true },
    { name: "PANINI MERGUEZ", description: "Sauce tomate ou crème fraîche + boisson", price: 7.5, image: "", categories: ["paninis"], active: true, displayOrder: 0, inStock: false },
    { name: "POULET", description: "Sauce tomate ou crème fraiche + boisson", price: 7.5, image: "", categories: ["paninis"], active: true, displayOrder: 1, inStock: false },
    { name: "VIANDE HACHÉE", description: "Sauce tomate ou crème fraiche + boisson", price: 7.5, image: "", categories: ["paninis"], active: true, displayOrder: 2, inStock: false },
    { name: "SAUMON", description: "Sauce tomate ou crème fraiche + boisson", price: 7.5, image: "", categories: ["paninis"], active: true, displayOrder: 3, inStock: false },
    { name: "4 FROMAGES", description: "Sauce tomate ou crème fraiche + boisson", price: 7.5, image: "", categories: ["paninis"], active: true, displayOrder: 4, inStock: false },
    { name: "THON", description: "Sauce tomate ou crème fraiche + boisson", price: 7.5, image: "", categories: ["paninis"], active: true, displayOrder: 5, inStock: false },
    { name: "CHEESEBURGER", description: "Steak, Cheddar, Crudités + Boisson 33cl", price: 6.5, image: "", categories: ["burgers"], active: true, displayOrder: 0, inStock: false },
    { name: "DOBLE CHEESE", description: "2 Steaks, 2 Cheddars, Crudités + Boisson 33cl", price: 8.5, image: "", categories: ["burgers"], active: true, displayOrder: 1, inStock: false },
    { name: "LE CHICKEN", description: "Galette de poulet, galette de pomme de terre et 2 cheddars, Crudités + Boisson 33cl", price: 7.5, image: "", categories: ["burgers"], active: true, displayOrder: 2, inStock: false },
    { name: "TACOS 1 VIANDE", description: "1 Viande au choix, servi with a drink 33cl", price: 7, image: "", categories: ["tacos"], active: true, displayOrder: 0, inStock: true },
    { name: "TACOS 2 VIANDES", description: "2 Viandes au choix, servi with a drink 33cl", price: 9, image: "/tacos2.jpeg", categories: ["tacos"], active: true, displayOrder: 1, inStock: true },
    { name: "FRITES", description: "", price: 3.5, image: "/tex-mex/frites.jpg", categories: ["tex-mex"], active: true, displayOrder: 0, inStock: true },
    { name: "POTATOES", description: "", price: 3.5, image: "/tex-mex/potatoes.jpg", categories: ["tex-mex"], active: true, displayOrder: 1, inStock: true },
    { name: "NUGGETS X8", description: "Servi avec frites ou potatoes", price: 10, image: "/tex-mex/nuggets.jpg", categories: ["tex-mex"], active: true, displayOrder: 2, inStock: true },
    { name: "NUGGETS X12", description: "Servi avec frites ou potatoes", price: 13, image: "/tex-mex/nuggets.jpg", categories: ["tex-mex"], active: true, displayOrder: 3, inStock: true },
    { name: "CHICKEN WINGS X10", description: "Servi avec frites ou potatoes", price: 10, image: "/tex-mex/wings.jpg", categories: ["tex-mex"], active: true, displayOrder: 4, inStock: true },
    { name: "CHICKEN WINGS X12", description: "Servi avec frites ou potatoes", price: 13, image: "/tex-mex/wings.jpg", categories: ["tex-mex"], active: true, displayOrder: 5, inStock: true },
    { name: "SAUMON", description: "Tomates cerises, saumon, avocat, oignon, pomme de terre", price: 7.5, image: "", categories: ["salades"], active: true, displayOrder: 0, inStock: false },
    { name: "THON", description: "Tomates cerises, thon, mais, olives noires, oeuf dur", price: 7.5, image: "", categories: ["salades"], active: true, displayOrder: 1, inStock: false },
    { name: "CHÈVRE CHAUD", description: "Tomates cerises, lardon, chèvre chaud", price: 7.5, image: "", categories: ["salades"], active: true, displayOrder: 2, inStock: false },
    { name: "FERMIÈRE", description: "Tomates cerises, poulet, pomme de terre, olives noires", price: 7.5, image: "/salade-poulet-min.jpg", categories: ["salades"], active: true, displayOrder: 3, inStock: false },
    { name: "TARTE AU DAIM", description: "", price: 4, image: "", categories: ["desserts"], active: true, displayOrder: 0 },
    { name: "TIRAMISU", description: "", price: 4, image: "/tiramisu.jpeg", categories: ["desserts"], active: true, displayOrder: 1 },
    { name: "BROWNIES", description: "", price: 4, image: "", categories: ["desserts"], active: true, displayOrder: 2 },
    { name: "TARTE AU CITRON", description: "", price: 4, image: "", categories: ["desserts"], active: true, displayOrder: 3 },
    { name: "BEN & JERRY'S 100 ml", description: "", price: 3, image: "", categories: ["desserts"], active: true, displayOrder: 4 },
    { name: "BEN & JERRY'S 500 ml", description: "", price: 6, image: "", categories: ["desserts"], active: true, displayOrder: 5 },
    { name: "Fanta Orange 33cl", price: 1.8, description: "", image: "/boissons/fanta-orange-33cl.jpg", categories: ["boissons"], active: true, displayOrder: 100, inStock: true },
    { name: "Coca-Cola Cherry 33cl", price: 1.8, description: "", image: "/boissons/coca-cola-cherry33cl.jpg", categories: ["boissons"], active: true, displayOrder: 101, inStock: true, popular: true },
    { name: "Orangina 33cl", price: 1.8, description: "", image: "/boissons/orangina33cl.jpg", categories: ["boissons"], active: true, displayOrder: 102, inStock: true },
    { name: "Perrier 33cl", price: 1.8, description: "", image: "/boissons/perrier33cl.jpg", categories: ["boissons"], active: true, displayOrder: 103, inStock: true },
    { name: "7 Up 33cl", price: 1.8, description: "", image: "/boissons/7up33cl.jpg", categories: ["boissons"], active: true, displayOrder: 104, inStock: true },
    { name: "Schweppes Agrumes 33cl", price: 1.8, description: "", image: "/boissons/schweppes-agrumes33cl.jpg", categories: ["boissons"], active: true, displayOrder: 105, inStock: true },
    { name: "Sprite 33cl", price: 1.8, description: "", image: "/boissons/sprite33cl.jpg", categories: ["boissons"], active: true, displayOrder: 106, inStock: true },
    { name: "Red Bull 25cl", price: 2.5, description: "", image: "/boissons/redbull.jpg", categories: ["boissons"], active: true, displayOrder: 107, inStock: true },
    { name: "Coca Cola 1.5L", price: 3.5, description: "", image: "/boissons/coca-cola1.5L.jpg", categories: ["boissons"], active: true, displayOrder: 108, inStock: true, popular: true },
    { name: "Fanta Orange 1.5L", price: 3.5, description: "", image: "/boissons/fanta1.5L.jpg", categories: ["boissons"], active: true, displayOrder: 109, inStock: true },
    { name: "Monster Energy 50cl", price: 2.5, description: "", image: "/boissons/monster.jpg", categories: ["boissons"], active: true, displayOrder: 110, inStock: true },
    { name: "Coca-Cola 33cl", price: 1.8, description: "", image: "/boissons/coca-cola33cl.jpg", categories: ["boissons"], active: true, displayOrder: 111, inStock: true, popular: true },
    { name: "Coca-Cola Zéro 33cl", price: 1.8, description: "", image: "/boissons/coca-cola-zero33cl.jpg", categories: ["boissons"], active: true, displayOrder: 112, inStock: true, popular: true },
    { name: "Ice Tea 33cl", price: 1.8, description: "", image: "/boissons/lipton-icetea33cl.jpg", categories: ["boissons"], active: true, displayOrder: 113, inStock: true },
    { name: "Oasis 33cl", price: 1.8, description: "", image: "/boissons/oasis-tropical-33cl.jpg", categories: ["boissons"], active: true, displayOrder: 114, inStock: true },
    { name: "Eau Minérale 33cl", price: 1.8, description: "", image: "", categories: ["boissons"], active: true, displayOrder: 115, inStock: true },
    { name: "Dada 33cl", price: 1.8, description: "", image: "", categories: ["boissons"], active: true, displayOrder: 116, inStock: true },
    { name: "Ice Tea 1.5L", price: 3.5, description: "", image: "/boissons/icetea1.5L.jpg", categories: ["boissons"], active: true, displayOrder: 117, inStock: true },
    { name: "Oasis 2L", price: 3.5, description: "", image: "/boissons/oasis2L.jpg", categories: ["boissons"], active: true, displayOrder: 118, inStock: true },
    { name: "Coca Cola Zéro 1.5L", price: 3.5, description: "", image: "", categories: ["boissons"], active: true, displayOrder: 0, inStock: true },
  ];

  for (const item of items) {
    await ctx.db.insert("menuItems", item);
  }
}

async function runSeedToppingAssignments(ctx: MutationCtx) {
  const items = await ctx.db.query("menuItems").collect();
  
  for (const item of items) {
    const cats = item.categories || [];
    
    if (cats.some(c => c.startsWith("pizzas-"))) {
      await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "taille", displayOrder: 0 });
      await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "supplements", displayOrder: 1 });
    } else if (cats.includes("tacos")) {
      if (item.name.includes("2 VIANDES")) {
        await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "2-viandes", displayOrder: 0 });
      } else {
        await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "viandes", displayOrder: 0 });
      }
      await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "sauces", displayOrder: 1 });
      await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "supplements", displayOrder: 2 });
    } else if (cats.includes("burgers") || cats.includes("paninis")) {
      await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "sauces", displayOrder: 0 });
      await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "supplements", displayOrder: 1 });
      await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "crudites", displayOrder: 2 });
    } else if (cats.includes("salades")) {
      await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "crudites", displayOrder: 0 });
      await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "supplements", displayOrder: 1 });
    } else if (cats.includes("tex-mex")) {
       await ctx.db.insert("menuItemToppings", { menuItemId: item._id, toppingCategoryId: "sauces", displayOrder: 0 });
    }
  }
}

async function runSeedRestaurantInfo(ctx: MutationCtx) {
  await ctx.db.insert("restaurantInfo", {
    key: "main",
    address: "20 Rue Saint-Pierre 57000 Metz",
    phone: "03 87 38 09 45",
    email: "contact@mondopizza57.fr",
    minimumAdvanceNotice: 30,
    pickupEnabled: true,
    deliveryEnabled: true,
    reviewsEnabled: true,
    defaultDeliveryFee: 0,
    freeDeliveryThreshold: 0,
    galleryEnabled: false,
    hours: [
      { day: "Lundi", time: "11h00 - 14h00 et 17h30 - 23h00" },
      { day: "Mardi", time: "11h00 - 14h00 et 17h30 - 23h00" },
      { day: "Mercredi", time: "11h00 - 14h00 et 17h30 - 23h00" },
      { day: "Jeudi", time: "11h00 - 14h00 et 17h30 - 23h00" },
      { day: "Vendredi", time: "11h00 - 14h00 et 17h30 - 23h00" },
      { day: "Samedi", time: "17h30 - 23h00" },
      { day: "Dimanche", time: "17h30 - 23h00" },
    ],
    socialLinks: { facebook: "", instagram: "", twitter: "" },
  });
}

async function runSeedReviews(ctx: MutationCtx) {
  const reviews = [
    { name: "Alonzo", rating: 5, comment: "Excellente expérience le patron (ou employer ) très gentil et poli et service super rapide et très très bonne pizza !!!", date: "12 mars 2026", active: true },
    { name: "Laura", rating: 5, comment: "Enfin une bonne pizzeria sur Metz avec des produits frais (ce qui est plus que rare de nos jours) et de la pâte faite maison !\nL'accueil est super, les gars sont très sympas et ça se voit qu'il aiment ce qu'ils font.\nEnviron 15min d'attente pour notre commande, au top 👌\nAllez-y, vous ne serez pas déçu !", date: "04 avril 2026", active: true },
    { name: "Naim", rating: 5, comment: "Meilleures pizza de metz accueil merveilleux, produits de qualités, goût et saveurs italienne. Merci de ramener cette spécialité italienne sur Metz sablon et de le partager avec nous un vrai régal avec des offres familiales à petit prix! Il y a des crêpes salées, sucrées, banane, fraises et framboise avec tout les goûts. Les dada enfin je sais où vous trouver !!!! Rien à dire vous êtes les meilleurs merci les italiens tounsi un grand cœur pour vous .", date: "30 avril 2025", active: true },
    { name: "Anita", rating: 5, comment: "La meilleure pizza de Metz\nDe super prix pour de super pizza\nEt surtout des Livreurs au Top\nMerciii Mondo Pizza", date: "30 mars 2025", active: true },
  ];
  for (const r of reviews) {
    await ctx.db.insert("reviews", r);
  }
}

// Exported Mutations
export const clearAllData = mutation({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    const tables = ["menuItems", "toppings", "toppingCategories", "menuItemToppings", "menuCategories", "restaurantInfo", "reviews", "gallery", "orders", "promoCodes", "users", "userSessions", "adminUsers", "adminSessions"] as const;
    for (const table of tables) {
      const items = await ctx.db.query(table).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
    }
    return { success: true };
  },
});

export const seedAll = mutation({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    // 1. Clear everything
    const tables = ["menuItems", "toppings", "toppingCategories", "menuItemToppings", "menuCategories", "restaurantInfo", "reviews", "gallery"] as const;
    for (const table of tables) {
      const items = await ctx.db.query(table).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
    }

    // 2. Run all seeds
    await runSeedCategories(ctx);
    await runSeedToppingCategories(ctx);
    await runSeedToppings(ctx);
    await runSeedMenuItems(ctx);
    await runSeedToppingAssignments(ctx);
    await runSeedRestaurantInfo(ctx);
    await runSeedReviews(ctx);
    
    return { success: true };
  },
});

export const exportData = mutation({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
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

export const importData = mutation({
  args: {
    adminToken: v.string(),
    data: v.any(),
    clearFirst: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);
    if (args.clearFirst) {
      const tables = ["menuItems", "toppings", "toppingCategories", "menuItemToppings", "menuCategories", "restaurantInfo", "reviews", "gallery"] as const;
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

export const createAdminUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const passwordHash = await hashPassword(args.password);
    const adminId = await ctx.db.insert("adminUsers", {
      username: args.username,
      passwordHash,
      createdAt: Date.now(),
    });
    return adminId;
  },
});

