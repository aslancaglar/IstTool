# Convex Integration Setup Guide

This project has been integrated with Convex as the backend. Follow these steps to complete the setup:

## Step 1: Initialize Convex

Run the following command in your terminal:

```bash
npx convex dev
```

This will:
- Prompt you to create a Convex account (or login)
- Create a new Convex project
- Generate a deployment URL
- Start the Convex dev server
- Generate TypeScript types in `convex/_generated/`

## Step 2: Update Environment Variables

After running `npx convex dev`, your `.env.local` file will be automatically created with your Convex URL:

```
VITE_CONVEX_URL=https://your-deployment-url.convex.cloud
```

## Step 3: Seed the Database

Once Convex is running, open the Convex dashboard or use the Convex CLI to run these mutations to populate your database:

1. **Seed Topping Categories:**
   ```bash
   npx convex run seed:seedToppingCategories
   ```

2. **Seed Toppings:**
   ```bash
   npx convex run seed:seedToppings
   ```

3. **Seed Menu Items:**
   ```bash
   npx convex run seed:seedMenuItems
   ```

Alternatively, you can run these from the Convex dashboard at https://dashboard.convex.dev

## Step 4: Start Your Development Server

```bash
npm run dev
```

Your application should now be running with Convex as the backend!

## What's Been Integrated

### Backend (Convex)

- **Schema**: Defined in `convex/schema.ts`
  - `menuItems`: All restaurant menu items
  - `toppingCategories`: Categories for toppings (sauces, crudités, etc.)
  - `toppings`: Individual toppings
  - `menuItemToppings`: Relationships between menu items and available toppings
  - `orders`: Customer orders

- **Queries**: Defined in `convex/queries.ts`
  - `getMenuItems`: Get all menu items
  - `getMenuItemsByCategory`: Filter menu items by category
  - `getPopularItems`: Get popular menu items
  - `getToppingCategories`: Get all topping categories with their toppings
  - `getToppingsForMenuItem`: Get available toppings for a specific menu item
  - `getOrder`: Get a specific order
  - `getAllOrders`: Get all orders (for admin)

- **Mutations**: Defined in `convex/mutations.ts`
  - `createOrder`: Create a new order
  - `addItemToOrder`: Add an item to an existing order
  - `removeItemFromOrder`: Remove an item from an order
  - `updateOrderStatus`: Update order status
  - `clearOrder`: Clear all items from an order
  - `deleteOrder`: Delete an order

- **Seed Functions**: Defined in `convex/seed.ts`
  - Functions to populate the database with initial data

### Frontend Integration

- **ConvexProvider**: Wraps the entire app in `src/main.tsx`
- **Menu Component**: Now fetches menu items from Convex in real-time
- **Order Management**: Currently uses localStorage for cart, ready to integrate with Convex for order persistence

## Next Steps

You can extend this integration by:

1. **Admin Dashboard**: Create an admin interface to manage menu items and view orders
2. **Real-time Order Updates**: Use Convex subscriptions for live order status updates
3. **Order History**: Store customer order history
4. **Analytics**: Track popular items and sales data

## Troubleshooting

If you encounter issues:

1. Make sure you're logged into Convex: `npx convex login`
2. Check that your `.env.local` file has the correct `VITE_CONVEX_URL`
3. Verify the Convex dev server is running: `npx convex dev`
4. Check the Convex dashboard for any errors: https://dashboard.convex.dev

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex React Quickstart](https://docs.convex.dev/quickstart/react)
- [Convex Dashboard](https://dashboard.convex.dev)
