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
