import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { snapshot } from "./data/snapshot";

export const seedToppingCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const toppingCategories = snapshot?.toppingCategories || [
      {
        categoryId: 'sauces',
        name: 'Sauces',
        minSelection: 0,
        maxSelection: 2,
        displayOrder: 0,
        active: true,
      },
      {
        categoryId: 'crudites',
        name: 'Crudités',
        minSelection: 0,
        maxSelection: undefined,
        displayOrder: 1,
        active: true,
      },
      {
        categoryId: 'supplements',
        name: 'Suppléments',
        minSelection: 0,
        maxSelection: undefined,
        displayOrder: 2,
        active: true,
      },
      {
        categoryId: 'viandes',
        name: 'Viandes',
        minSelection: 0,
        maxSelection: 3,
        displayOrder: 3,
        active: true,
      },
    ];

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
    const toppings = snapshot?.toppings || [
      { toppingId: 'sauce-blanche', name: 'Sauce Blanche', price: undefined, categoryId: 'sauces', displayOrder: 0, active: true },
      { toppingId: 'sauce-andalouse', name: 'Sauce Andalouse', price: undefined, categoryId: 'sauces', displayOrder: 1, active: true },
      { toppingId: 'sauce-barbecue', name: 'Sauce Barbecue', price: undefined, categoryId: 'sauces', displayOrder: 2, active: true },
      { toppingId: 'sauce-algerienne', name: 'Sauce Algérienne', price: undefined, categoryId: 'sauces', displayOrder: 3, active: true },
      { toppingId: 'sauce-samurai', name: 'Sauce Samurai', price: undefined, categoryId: 'sauces', displayOrder: 4, active: true },
      { toppingId: 'sauce-ketchup', name: 'Ketchup', price: undefined, categoryId: 'sauces', displayOrder: 5, active: true },
      { toppingId: 'sauce-mayo', name: 'Mayonnaise', price: undefined, categoryId: 'sauces', displayOrder: 6, active: true },
      { toppingId: 'sauce-curry', name: 'Sauce Curry', price: undefined, categoryId: 'sauces', displayOrder: 7, active: true },
      { toppingId: 'sauce-biggy', name: 'Sauce Biggy', price: undefined, categoryId: 'sauces', displayOrder: 8, active: true },
      { toppingId: 'sauce-moutarde', name: 'Moutarde', price: undefined, categoryId: 'sauces', displayOrder: 9, active: true },
      { toppingId: 'sauce-harissa', name: 'Harissa', price: undefined, categoryId: 'sauces', displayOrder: 10, active: true },
      { toppingId: 'salade', name: 'Salade', price: undefined, categoryId: 'crudites', displayOrder: 0, active: true },
      { toppingId: 'tomate', name: 'Tomate', price: undefined, categoryId: 'crudites', displayOrder: 1, active: true },
      { toppingId: 'oignon', name: 'Oignon', price: undefined, categoryId: 'crudites', displayOrder: 2, active: true },
      { toppingId: 'chou-rouge', name: 'Chou Rouge', price: undefined, categoryId: 'crudites', displayOrder: 3, active: true },
      { toppingId: 'cheddar', name: 'cheddar', price: 1.0, categoryId: 'supplements', displayOrder: 0, active: true },
      { toppingId: 'feta', name: 'Feta', price: 1.0, categoryId: 'supplements', displayOrder: 1, active: true },
      { toppingId: 'poulet', name: 'Poulet', price: undefined, categoryId: 'viandes', displayOrder: 0, active: true },
      { toppingId: 'viande-hachee', name: 'Viande Hachée', price: undefined, categoryId: 'viandes', displayOrder: 1, active: true },
      { toppingId: 'mergez', name: 'Mergez', price: undefined, categoryId: 'viandes', displayOrder: 2, active: true },
      { toppingId: 'kebab', name: 'Kebab', price: undefined, categoryId: 'viandes', displayOrder: 3, active: true },
      { toppingId: 'cordon-bleu', name: 'Cordon Bleu', price: undefined, categoryId: 'viandes', displayOrder: 4, active: true },
    ];

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


export const seedMenuItems = mutation({
  args: {},
  handler: async (ctx) => {
    const menuItems = snapshot?.menuItems || [
      { name: 'Sandwich Kebab', description: 'Pain frais, viande kebab, crudites et sauce au choix', price: 7.00, image: 'https://images.pexels.com/photos/6941010/pexels-photo-6941010.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'], popular: true },
      { name: 'Maxi Kebab', description: 'Version XXL de notre kebab classique avec double viande', price: 10.00, image: 'https://images.pexels.com/photos/5779367/pexels-photo-5779367.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'], popular: true },
      { name: 'Merguez', description: 'Sandwich merguez grillees, salade, tomates, oignons', price: 7.00, image: 'https://images.pexels.com/photos/12842118/pexels-photo-12842118.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Saucisse Turque', description: 'Saucisse turque epices, crudites fraiches', price: 7.00, image: 'https://images.pexels.com/photos/4958641/pexels-photo-4958641.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Saucisse blanche', description: 'Saucisse blanche grillees, crudites fraiches', price: 6.50, image: 'https://images.pexels.com/photos/4958641/pexels-photo-4958641.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Köfte', description: 'Boulettes de viande epicees a la turque', price: 7.00, image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Spécial Köfte', description: 'Köfte avec oeuf et fromage', price: 8.50, image: 'https://images.pexels.com/photos/6941010/pexels-photo-6941010.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Adana', description: 'Brochette de viande hachee epicee a la turque', price: 7.50, image: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Mixte', description: 'Melange kebab et poulet, double plaisir', price: 9.00, image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'], popular: true },
      { name: 'Hamburger', description: 'Pain brioche, steak hache, crudites et sauce', price: 6.50, image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Cheesburger', description: 'Hamburger avec fromage fondu', price: 7.00, image: 'https://images.pexels.com/photos/580612/pexels-photo-580612.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Fish', description: 'Filet de poisson pane, salade et sauce', price: 6.50, image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Brochette Poulet', description: 'Morceaux de poulet marines et grilles', price: 7.50, image: 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Brochette Veau', description: 'Morceaux de veau marines et grilles', price: 9.00, image: 'https://images.pexels.com/photos/5779367/pexels-photo-5779367.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Brochette Agneau', description: 'Morceaux d\'agneau marines et grilles', price: 9.00, image: 'https://images.pexels.com/photos/6542788/pexels-photo-6542788.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Chickenburger', description: 'Pain brioche, poulet pane, crudites et sauce', price: 7.00, image: 'https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches'] },
      { name: 'Sandwich Végétarien', description: '', price: 5.50, image: 'https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches-vegetarien'] },
      { name: 'Pain Frites', description: '', price: 6.00, image: 'https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches-vegetarien'] },
      { name: 'Pan Bagnat', description: '', price: 6.00, image: 'https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches-vegetarien'] },
      { name: 'Fish', description: '', price: 6.50, image: 'https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches-vegetarien'] },
      { name: 'Sandwich Falafels', description: '', price: 6.50, image: 'https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['sandwiches-vegetarien'] },
      { name: 'Assiette Kebab', description: 'Au choix: riz, pates, frites ou ble', price: 13.00, image: 'https://images.pexels.com/photos/6542788/pexels-photo-6542788.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'], popular: true },
      { name: 'Assiette Steak Haché', description: 'Poulet grille avec accompagnement au choix', price: 14.00, image: 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette Cheese', description: 'Assortiment special du chef avec accompagnements', price: 17.00, image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'], popular: true },
      { name: 'Assiette Falafels', description: 'Tenders croustillants avec accompagnement', price: 14.00, image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette Tenders', description: 'Falafels maison sans viande avec accompagnement', price: 13.00, image: 'https://images.pexels.com/photos/6275166/pexels-photo-6275166.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette Cordon Bleu', description: 'Falafels maison sans viande with accompagnement', price: 13.00, image: 'https://images.pexels.com/photos/6275166/pexels-photo-6275166.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette Merguez', description: 'Falafels maison sans viande with accompagnement', price: 13.00, image: 'https://images.pexels.com/photos/6275166/pexels-photo-6275166.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette du Chef', description: 'Falafels maison sans viande with accompagnement', price: 13.00, image: 'https://images.pexels.com/photos/6275166/pexels-photo-6275166.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette Adana', description: 'Falafels maison sans viande with accompagnement', price: 13.00, image: 'https://images.pexels.com/photos/6275166/pexels-photo-6275166.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette Saucisse Turque', description: 'Falafels maison sans viande with accompagnement', price: 13.00, image: 'https://images.pexels.com/photos/6275166/pexels-photo-6275166.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette Kofte', description: 'Falafels maison sans viande with accompagnement', price: 13.00, image: 'https://images.pexels.com/photos/6275166/pexels-photo-6275166.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette Agneau', description: 'Falafels maison sans viande with accompagnement', price: 13.00, image: 'https://images.pexels.com/photos/6275166/pexels-photo-6275166.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette Veau', description: 'Falafels maison sans viande with accompagnement', price: 13.00, image: 'https://images.pexels.com/photos/6275166/pexels-photo-6275166.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Assiette Poulet', description: 'Falafels maison sans viande with accompagnement', price: 13.00, image: 'https://images.pexels.com/photos/6275166/pexels-photo-6275166.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['assiettes'] },
      { name: 'Tacos 1 Viande', description: 'Viande au choix, frites, fromage et sauce', price: 8.00, image: 'https://images.pexels.com/photos/4958641/pexels-photo-4958641.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['tacos'] },
      { name: 'Tacos 2 Viandes', description: '2 viandes au choix, frites, fromage et sauce', price: 10.00, image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['tacos'], popular: true },
      { name: 'Tacos 3 Viandes', description: '3 viandes au choix, frites, fromage et sauce', price: 12.00, image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['tacos'] },
      { name: 'Durum Kebab', description: 'Galette fine, viande kebab, salade et sauce', price: 7.50, image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['durum'], popular: true },
      { name: 'Durum Poulet', description: 'Galette fine, poulet grille, crudites', price: 8.00, image: 'https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['durum'] },
      { name: 'Durum Tenders', description: 'Galette fine, tenders croustillants, sauce', price: 8.00, image: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['durum'] },
      { name: 'Maxi Durum', description: 'Version XXL de notre durum', price: 10.00, image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['durum'] },
      { name: 'Pizza Kebab', description: 'Wrap pizza garni de viande kebab', price: 8.00, image: 'https://images.pexels.com/photos/845808/pexels-photo-845808.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['pizzas'], popular: true },
      { name: 'Pizza Turque', description: 'Wrap pizza aux saveurs turques', price: 6.50, image: 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['pizzas'] },
      { name: 'Pizza Poulet', description: 'Wrap pizza garni de poulet', price: 8.50, image: 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['pizzas'] },
      { name: 'Barquette Frites', description: 'Frites fraiches et croustillantes', price: 3.50, image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['barquettes'] },
      { name: 'Barquette Viande Kebab', description: 'Barquette de viande kebab seule', price: 7.00, image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['barquettes'] },
      { name: 'Barquette Viande Poulet', description: 'Barquette de viande kebab seule', price: 7.00, image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['barquettes'] },
      { name: 'Barquette Viande Blé', description: 'Barquette de viande kebab seule', price: 7.00, image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['barquettes'] },
      { name: 'Nuggets', description: 'Nuggets de poulet croustillants (x4, x6, x9, x12)', price: 4.00, image: 'https://images.pexels.com/photos/928218/pexels-photo-928218.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['barquettes'] },
      { name: 'Mozza Sticks', description: 'Tenders de poulet panes (4.50, 6.50, 10.00, 13.50)', price: 4.50, image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['barquettes'] },
      { name: 'Box Poulet', description: 'Tenders de poulet panes (4.50, 6.50, 10.00, 13.50)', price: 4.50, image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['barquettes'] },
      { name: 'Box Kebab', description: 'Box avec viande kebab', price: 7.50, image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['box'] },
      { name: 'Box Poulet', description: 'Box with poulet grille', price: 8.50, image: 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['box'] },
      { name: 'Salade Feta', description: 'Salade fraiche with fromage feta', price: 7.50, image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['salades'] },
      { name: 'Salade Thon', description: 'Salade composee au thon', price: 9.00, image: 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['salades'] },
      { name: 'Salade Poulet', description: 'Salade fraiche with poulet grille', price: 9.00, image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['salades'] },
      { name: 'Salade Tenders', description: 'Salade fraiche with poulet grille', price: 9.00, image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['salades'] },
      { name: 'Bowl Riz', description: 'Viandes au choix: kebab, brochettes, steak, kofte', price: 9.50, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['bowls'], popular: true },
      { name: 'Bowl Pates', description: 'Viandes au choix: kebab, brochettes, steak, kofte', price: 9.50, image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['bowls'], popular: true },
      { name: 'Kapsalon 1 Viande', description: 'Frites, fromage, salade et viande au choix', price: 10.00, image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['kapsalon'], popular: true },
      { name: 'Kapsalon 2 Viandes', description: 'Frites, fromage, salade et 2 viandes au choix', price: 12.00, image: 'https://images.pexels.com/photos/6542788/pexels-photo-6542788.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['kapsalon'], popular: true },
      { name: 'Tiramisu', description: 'Dessert italien traditionnel', price: 3.50, image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['desserts'] },
      { name: 'Baklava', description: 'Les 3 pieces', price: 4.00, image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['desserts'], popular: true },
      { name: 'Soft 33cl', description: 'Boisson gazeuse 33cl', price: 2.00, image: 'https://images.pexels.com/photos/2983100/pexels-photo-2983100.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['boissons'] },
      { name: 'Soft 50cl', description: 'Boisson gazeuse 50cl', price: 3.50, image: 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['boissons'] },
      { name: 'Soft 1,5L', description: 'Boisson gazeuse 1,5L', price: 4.50, image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['boissons'] },
      { name: 'Red Bull', description: 'Boisson energisante', price: 3.50, image: 'https://images.pexels.com/photos/3169775/pexels-photo-3169775.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['boissons'] },
      { name: 'Eau 50cl', description: 'Eau minerale', price: 1.50, image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['boissons'] },
      { name: 'The', description: 'The chaud', price: 1.50, image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['boissons'] },
      { name: 'Cafe', description: 'Cafe expresso', price: 1.50, image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600', categories: ['boissons'] },
    ];

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
      { categories: ['sandwiches', 'sandwiches-vegetarien', 'assiettes', 'durum', 'pizzas', 'box', 'pizzas-base-tomate', 'pizzas-base-creme', 'pizzas-speciales', 'paninis', 'burgers', 'tex-mex'], toppingCategories: ['sauces', 'crudites', 'supplements'] },
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
    const categories = snapshot?.menuCategories || [
      { name: 'Sandwichs', slug: 'sandwiches', displayOrder: 0, active: true },
      { name: 'Sandwichs Végétarien', slug: 'sandwiches-vegetarien', displayOrder: 1, active: true },
      { name: 'Assiettes', slug: 'assiettes', displayOrder: 2, active: true },
      { name: 'Barquettes', slug: 'barquettes', displayOrder: 3, active: true },
      { name: 'Salades', slug: 'salades', displayOrder: 4, active: true },
      { name: 'Pizzas', slug: 'pizzas', displayOrder: 5, active: true },
      { name: 'Tacos', slug: 'tacos', displayOrder: 6, active: true },
      { name: 'Durum', slug: 'durum', displayOrder: 7, active: true },
      { name: 'Bowls', slug: 'bowls', displayOrder: 8, active: true },
      { name: 'Kapsalon', slug: 'kapsalon', displayOrder: 9, active: true },
      { name: 'Box', slug: 'box', displayOrder: 10, active: true },
      { name: 'Desserts', slug: 'desserts', displayOrder: 11, active: true },
      { name: 'Boissons', slug: 'boissons', displayOrder: 12, active: true },
    ];

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
    const items = [
      { name: 'MARGHERITA', description: 'Sauce tomate, mozzarella', price: 10.00, image: '/pizzas/base-tomate/Margherita.jpg' },
      { name: 'REGINA', description: 'Sauce tomate, mozzarella, champignons, jambon', price: 12.00, image: '/pizzas/base-tomate/regina.jpg' },
      { name: 'AU THON', description: 'Sauce tomate, mozzarella, thon, oignon, poivron, olives noires', price: 12.00, image: '/pizzas/base-tomate/au-thon.jpg' },
      { name: '4 FROMAGES', description: 'Sauce tomate, mozzarella, brie, chèvre, gorgonzola', price: 12.00, image: '/pizzas/base-tomate/4-fromages.jpg' },
      { name: 'CAMPIONE', description: 'Sauce tomate, mozzarella, viande hachée, champignons', price: 12.00, image: '/pizzas/base-tomate/campione.jpg' },
      { name: 'ORIENTALE', description: 'Sauce tomate, mozzarella, merguez, poivron, olives noires, oignon, oeuf', price: 12.00, image: '/pizzas/base-tomate/orientale.jpg' },
      { name: 'ROYALE', description: 'Sauce tomate, mozzarella, merguez, viande hachée, poulet', price: 12.00, image: '/pizzas/base-tomate/royale.jpg' },
      { name: '4 SAISONS', description: 'Sauce tomate, mozzarella, jambon, champignons, artichaut, olives noires', price: 12.00, image: '/pizzas/base-tomate/4saisons.jpg' },
      { name: 'VÉGÉTARIENNE', description: 'Sauce tomate, mozzarella, champignons, poivron, oignon, artichaut, aubergine, olives noires', price: 12.00, image: '/pizzas/base-tomate/vegetarienne.jpg' },
      { name: 'NAPOLITAINE', description: 'Sauce tomate, mozzarella, anchois, câpre, olives noires', price: 12.00, image: '/pizzas/base-tomate/napolitaine.jpg' },
      { name: '4 JAMBONS', description: 'Sauce tomate, mozzarella, jambon, lardons, bacon, pepperoni', price: 13.50, image: '/pizzas/base-tomate/4jambons.jpg' },
      { name: 'PEPPERONI', description: 'Sauce tomate, mozzarella, pepperoni, oeuf', price: 12.00, image: '/pizzas/base-tomate/pepperoni.jpg' },
      { name: 'KEBAB', description: 'Sauce tomate, mozzarella, viande kebab, oignon, olives noires', price: 12.00, image: '/pizzas/base-tomate/kebab.jpg' },
      { name: 'CALZONE', description: 'Sauce tomate, mozzarella, champignons, jaune d\'oeuf, jambon ou viande hachée ou poulet ou thon', price: 13.50, image: '/pizzas/base-tomate/calzone.jpg' },
      { name: 'FRUITS DE MER', description: 'Sauce tomate, mozzarella, cocktail de fruits de mer', price: 12.00, image: '/pizzas/base-tomate/fruitsdemer.jpg' },
      { name: 'HAWAÏENNE', description: 'Sauce tomate, mozzarella, jambon, ananas, maïs', price: 12.00, image: '/pizzas/base-tomate/hawaienne.jpg' },
    ];

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
    const items = [
      { name: 'SAUMON', description: 'Base crème, mozzarella, saumon, pomme de terre, oignon', price: 12.00, image: '/pizzas/base-creme/saumon.jpg' },
      { name: 'CHÈVRE MIEL', description: 'Base crème, mozzarella, chèvre, miel', price: 12.00, image: '/pizzas/base-creme/chevre-miel.jpg' },
      { name: 'RACLETTE', description: 'Base crème, mozzarella, jambon, pomme de terre, raclette', price: 12.00, image: '/pizzas/base-creme/raclette.jpg' },
      { name: 'FLAMME', description: 'Base crème, mozzarella, lardons, oignon', price: 12.00, image: '/pizzas/base-creme/flamme.jpg' },
      { name: 'CHICKEN', description: 'Base crème, mozzarella, champignons, poulet, poivron', price: 12.00, image: '/pizzas/base-creme/chicken.jpg' },
      { name: '4 FROMAGES', description: 'Base crème, mozzarella, brie, chèvre, gorgonzola', price: 12.00, image: '/pizzas/base-creme/4fromages.jpg' },
      { name: 'FC METZ', description: 'Base crème, mozzarella, brie, chèvre, gorgonzola', price: 12.00, image: '/pizzas/base-creme/fcmetz.jpg' },
      { name: 'MONDO', description: 'Base crème, mozzarella, jambon, pomme de terre, champignons, reblochon, oignon', price: 12.00, image: '/pizzas/base-creme/mondo.jpg' },
    ];

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
    const items = [
      { name: 'ALGÉRIENNE', description: 'Sauce algérienne, mozzarella, viande hachée, pomme de terre, poivron, olives noires', price: 13.50, image: '' },
      { name: 'CURRY', description: 'Sauce curry, mozzarella, poulet, oignon, poivron', price: 13.50, image: '' },
      { name: 'ANDALOUSE', description: 'Sauce andalouse, mozzarella, poulet, oignon, poivron, chèvre', price: 13.50, image: '' },
      { name: 'BARBECUE', description: 'Sauce barbecue, mozzarella, viande hachée, oignon', price: 13.50, image: '' },
    ];

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
    const items = [
      { name: 'PANINI MERGUEZ', description: 'Sauce tomate ou crème fraîche + boisson', price: 7.50, image: '' },
      { name: 'POULET', description: 'Sauce tomate ou crème fraiche + boisson', price: 7.50, image: '' },
      { name: 'VIANDE HACHÉE', description: 'Sauce tomate ou crème fraiche + boisson', price: 7.50, image: '' },
      { name: 'SAUMON', description: 'Sauce tomate ou crème fraiche + boisson', price: 7.50, image: '' },
      { name: '4 FROMAGES', description: 'Sauce tomate ou crème fraiche + boisson', price: 7.50, image: '' },
      { name: 'THON', description: 'Sauce tomate ou crème fraiche + boisson', price: 7.50, image: '' },
    ];

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
    const items = [
      { name: 'CHEESEBURGER', description: 'Steak, Cheddar, Crudités + Boisson 33cl', price: 6.50, image: '' },
      { name: 'DOBLE CHEESE', description: '2 Steaks, 2 Cheddars, Crudités + Boisson 33cl', price: 8.50, image: '' },
      { name: 'LE CHICKEN', description: 'Galette de poulet, galette de pomme de terre et 2 cheddars, Crudités + Boisson 33cl', price: 7.50, image: '' },
    ];

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
    const items = [
      { name: 'TACOS 1 VIANDE', description: '1 Viande au choix, servi avec un boisson 33cl', price: 7.00, image: '/tacos.jpeg' },
      { name: 'TACOS 2 VIANDES', description: '2 Viandes au choix, servi avec un boisson 33cl', price: 9.00, image: '/tacos2.jpeg' },
    ];

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
    const items = [
      { name: 'FRITES', description: '', price: 3.50, image: '/frites.jpeg' },
      { name: 'POTATOES', description: '', price: 3.50, image: '' },
      { name: 'NUGGETS X8', description: 'Servi avec frites ou potatoes', price: 10.00, image: '' },
      { name: 'NUGGETS X12', description: 'Servi avec frites ou potatoes', price: 13.00, image: '' },
      { name: 'CHICKEN WINGS X10', description: 'Servi avec frites ou potatoes', price: 10.00, image: '' },
      { name: 'CHICKEN WINGS X12', description: 'Servi avec frites ou potatoes', price: 13.00, image: '' },
    ];

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
    const items = [
      { name: 'SAUMON', description: 'Tomates cerises, saumon, avocat, oignon, pomme de terre', price: 7.50, image: '' },
      { name: 'THON', description: 'Tomates cerises, thon, mais, olives noires, oeuf dur', price: 7.50, image: '' },
      { name: 'CHÈVRE CHAUD', description: 'Tomates cerises, lardon, chèvre chaud', price: 7.50, image: '' },
      { name: 'FERMIÈRE', description: 'Tomates cerises, poulet, pomme de terre, olives noires', price: 7.50, image: '/salade-poulet-min.jpg' },
    ];

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
    const items = [
      { name: 'TARTE AU DAIM', description: '', price: 4.00, image: '' },
      { name: 'TIRAMISU', description: '', price: 4.00, image: '/tiramisu.jpeg' },
      { name: 'BROWNIES', description: '', price: 4.00, image: '' },
      { name: 'TARTE AU CITRON', description: '', price: 4.00, image: '' },
      { name: "BEN & JERRY'S 100 ml", description: '', price: 3.00, image: '' },
      { name: "BEN & JERRY'S 500 ml", description: '', price: 6.00, image: '' },
    ];

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
    // 1. Create Category
    const categorySlug = "boissons";
    const existingCategory = await ctx.db
      .query("menuCategories")
      .withIndex("by_slug", (q) => q.eq("slug", categorySlug))
      .first();
    
    if (!existingCategory) {
      await ctx.db.insert("menuCategories", {
        name: "Boissons",
        slug: categorySlug,
        displayOrder: 9, // After desserts
        active: true,
      });
    }

    // 2. Add Items
    const items = [
      { name: 'COCA COLA', description: '', price: 1.50, image: '' },
      { name: 'COCA COLA ZÉRO', description: '', price: 1.50, image: '' },
      { name: 'COCA CHERRY', description: '', price: 1.50, image: '' },
      { name: 'ORANGINA', description: '', price: 1.50, image: '' },
      { name: 'PERRIER', description: '', price: 1.50, image: '' },
      { name: 'SEVEN UP', description: '', price: 1.50, image: '' },
      { name: 'EAU MINÉRALE', description: '', price: 1.50, image: '' },
      { name: 'SCHWEPPES AGRUMES', description: '', price: 1.50, image: '' },
      { name: 'DADA', description: '', price: 1.50, image: '' },
      { name: 'FANTA', description: '', price: 1.50, image: '' },
      { name: 'OASIS', description: '', price: 1.50, image: '' },
      { name: 'SPRITE', description: '', price: 1.50, image: '' },
      { name: 'ICE TEA', description: '', price: 1.50, image: '' },
      { name: 'FREEZ', description: '', price: 1.50, image: '' },
      { name: 'RED BULL', description: '', price: 2.50, image: '' },
    ];

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
      address: "11 Rue nationale, 57190 Florange",
      phone: "03 87 38 09 45",
      email: "contact@karadeniz.fr",
      hours: [
        { day: 'Lun - Sam', time: '11h00 - 15h00 et 17h00 - 00h00' },
        { day: 'Dim', time: '17h00 - 00h00' },
      ],
      socialLinks: {
        facebook: "https://facebook.com/karadeniz",
        instagram: "https://instagram.com/karadeniz",
        twitter: "https://twitter.com/karadeniz",
      },
    });
    return { success: true, skipped: false };
  },
});


export const seedReviews = mutation({
  args: {},
  handler: async (ctx) => {
    const reviews = [
      {
        name: 'Audrey',
        rating: 5,
        comment: 'Prix plus que raisonnable au regard de la quantité et de la qualité des sandwichs. Sur place comme à emporter, tout est toujours bien.',
        date: '15 Janvier 2025',
        active: true
      },
      {
        name: 'Eric',
        rating: 5,
        comment: 'Un bon petit restaurant turc avec de grandes plages horaires pour venir manger ou emporter différentes spécialités provenant de la région de la mer noire...et d autres plus classiques.',
        date: '22 Janvier 2025',
        active: true
      },
      {
        name: 'Jean Dartois',
        rating: 5,
        comment: 'C\'est simple. c\'est le meilleur kebab que j\'ai pu manger depuis 20 ans! J\'habite dans le sud et lorsque je remonte dans l\'est, j en profite un max. Je les adore!!!!!',
        date: '28 Janvier 2025',
        active: true
      },
      {
        name: 'Marc',
        rating: 5,
        comment: 'Personnel agréable, rapide.. Jamais d\'oublies dans mes commandes. Repas chaud 👍, prix raisonnables vu la crise et eux n\'ont pas augmenter le prix fortement. Malgré les charges. Bravo c super bon =>. Je reviendrai.',
        date: '30 Janvier 2025',
        active: true
      },
    ];

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
    const images = [
      {
        title: 'Kebab Delicieux',
        image: '/kebab-out-min.jpg',
        displayOrder: 1,
        active: true,
      },
      {
        title: 'Durum Frais',
        image: '/durum-kebab-out-min.jpg',
        displayOrder: 2,
        active: true,
      },
      {
        title: 'Salade Poulet',
        image: '/salade-poulet-min.jpg',
        displayOrder: 3,
        active: true,
      },
      {
        title: 'Notre Chef',
        image: '/kebabman-min-1.jpg',
        displayOrder: 4,
        active: true,
      },
      {
        title: 'Durum Special',
        image: '/durum-man-out-min.jpg',
        displayOrder: 5,
        active: true,
      },
      {
        title: 'Preparation Durum',
        image: '/durum-kebab-making-min.jpg',
        displayOrder: 6,
        active: true,
      },
    ];

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

