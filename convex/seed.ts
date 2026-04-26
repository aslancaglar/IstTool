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
      { categories: ['sandwiches', 'sandwiches-vegetarien', 'assiettes', 'durum', 'pizzas', 'box'], toppingCategories: ['sauces', 'crudites', 'supplements'] },
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

