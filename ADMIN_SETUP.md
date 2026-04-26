# Admin Dashboard Setup Guide

This guide will help you set up and use the admin dashboard for your restaurant website.

## Initial Setup

### 1. Seed the Database

Before using the admin dashboard, you need to populate the database with initial data. Follow these steps in order:

1. Open your Convex dashboard (run `npx convex dev` if not already running)
2. Navigate to the Functions tab
3. Run the following mutations in this exact order:

   ```
   1. seed:clearAllData (optional - only if you want to start fresh)
   2. seed:seedMenuCategories
   3. seed:seedToppingCategories
   4. seed:seedToppings
   5. seed:seedMenuItems
   6. seed:seedMenuItemToppings
   7. seed:seedRestaurantInfo
   8. seed:createAdminUser
   ```

### 2. Admin Login Credentials

After running `createAdminUser`, you can log in with:
- **Username**: `admin`
- **Password**: `admin123`

**IMPORTANT**: Change this password immediately after your first login by creating a new admin user with a secure password.

## Accessing the Admin Dashboard

1. Navigate to `/admin/login` in your browser
2. Enter your credentials
3. You'll be redirected to the admin dashboard

## Admin Dashboard Features

### Dashboard Home
- View statistics for categories, menu items, toppings, and orders
- See recent orders and quick stats
- Monitor pending orders

### Menu Categories Management (`/admin/categories`)
- Create, edit, and delete menu categories
- Set display order for categories
- Activate or deactivate categories
- Categories include: Sandwiches, Assiettes, Tacos, Durum, etc.

### Menu Items Management (`/admin/menu-items`)
- Full CRUD operations for menu items
- Set prices (normal, with fries, menu)
- Add item descriptions and images
- Mark items as popular
- Set display order
- Activate or deactivate items

### Toppings Management (`/admin/toppings`)
- Manage topping categories (Sauces, Crudités, Suppléments, Viandes)
- Add, edit, and delete individual toppings
- Set topping prices
- Organize toppings by category

### Orders Management (`/admin/orders`)
- View all customer orders in real-time
- Filter orders by status (pending, preparing, completed, cancelled)
- Update order status
- View order details including items and customizations

### Restaurant Settings (`/admin/settings`)
- Update contact information (address, phone, email)
- Manage business hours
- Update social media links (Facebook, Instagram, Twitter)

## Important Notes

### Authentication
- Admin sessions are stored in localStorage
- Logout from the sidebar menu to end your session
- Only authenticated admins can access dashboard pages

### Database Operations
- All changes are saved to Convex in real-time
- No manual save required for most operations
- Settings page has a "Save Changes" button

### Image URLs
- Menu items use external image URLs
- Make sure image URLs are valid and publicly accessible
- Consider using a CDN or image hosting service

### Categories and Slugs
- Category slugs must match between menu categories and menu items
- Existing slugs: sandwiches, sandwiches-vegetarien, assiettes, barquettes, salades, pizzas, tacos, durum, bowls, kapsalon, box, desserts, boissons

## Troubleshooting

### Cannot Login
- Verify you've run `createAdminUser` mutation
- Check Convex console for any errors
- Clear browser localStorage and try again

### Menu Items Not Showing
- Verify menu categories are created first
- Check that menu items have matching category slugs
- Ensure items are marked as active

### Orders Not Appearing
- Orders are created through the frontend ordering system
- Check Convex dashboard to verify orders table has data

## Security Recommendations

1. **Change Default Password**: Immediately create a new admin user with a strong password
2. **Use HTTPS**: Always use HTTPS in production
3. **Regular Backups**: Export your Convex data regularly
4. **Access Control**: Keep admin credentials secure

## Support

For issues or questions:
1. Check the Convex documentation: https://docs.convex.dev
2. Review the schema in `convex/schema.ts`
3. Check mutations in `convex/*.ts` files
