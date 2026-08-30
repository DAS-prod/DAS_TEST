# Database schema change

The requested seller-oriented schema reduction is intentionally NOT applied automatically in this code package.

The current checkout implementation still uses the existing `orders`, `order_items`, `order_payments`, and `addresses` tables. Replacing those tables without the exact approved final schema would break production checkout.

Before applying the database migration, lock the final columns/relationships for:
- auth users
- customers
- addresses
- orders
- order_items
- order_payments

Then migrate the checkout/account queries together.

This is the only deliberately deferred item; all frontend/catalogue changes in this package are independent of that migration.
