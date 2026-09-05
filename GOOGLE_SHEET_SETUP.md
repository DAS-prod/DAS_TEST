# Godavari Basket Google Sheet — required product fields

The product API reads the sheet on every request with `cache: no-store`.

Keep the existing product columns. Add these optional discovery fields:

- `parent_category` — one of: Seasonal, Sweets, Snacks, Pickles, Podis, Papads, Millets, Ghees & Oils, Essentials, Art & Traditionals
- `category` — product-level category if needed
- `subcategory` — the subcategory displayed after a main category is selected
- `collection` — optional: `combo`, `gift`, or blank
- `gift_type` — optional gifting classification
- `tags` — optional searchable tags

## Example

| name | parent_category | category | subcategory | collection | gift_type |
|---|---|---|---|---|---|
| Avakaya | Pickles | Pickles | Vegetarian | | |
| Chicken Pickle | Pickles | Pickles | Non-Vegetarian | | |
| Festival Sweet Box | Sweets | Sweets | Seasonal | gift | Festival |
| Godavari Breakfast Combo | Snacks | Snacks | Combo | combo | |

`id`, `name`, `price`, `image`, `description`, `stock`, and `active` remain required for normal catalogue operation.

For a product to appear on the Combos page, set `collection` to `combo`.
For a product to appear on the Gifting page, set `collection` to `gift` (or provide a non-empty `gift_type`).

Do not put secrets in the Google Sheet.

## Product weight / price variants

The product API now supports multiple weight-price columns directly from Google Sheets.

Keep the existing `size` and `price` columns for the default/base option. For additional options, add columns such as:

- `250g`
- `500g`
- `1kg`

The following naming styles are also accepted:

- `250g_price`
- `price_250g`
- `500g_price`
- `price_500g`

Put the selling price in the respective cell. Blank or zero variant cells are ignored. The customer product card will automatically show the available sizes and the checkout server validates the selected size and price against the Google Sheet API.
