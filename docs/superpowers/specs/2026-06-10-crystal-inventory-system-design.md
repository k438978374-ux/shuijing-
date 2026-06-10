# Crystal Inventory System Design

## Goal

Build a simple local web system for managing a small crystal bracelet business. The first version should help record bead and accessory inventory, calculate weighted-average material costs, make finished bracelets from recipes or custom material lists, track finished-goods inventory, record sales, and show profit summaries.

The system is designed for one user on one computer. It should prioritize clear daily workflow over advanced business features.

## Scope

Version 1 includes:

- Material inventory for crystal beads, spacers, findings, string, packaging items, and similar components.
- Purchase records that increase material inventory and update weighted-average costs.
- Recipe/style records for repeatable bracelet designs.
- Finished-goods production from saved recipes or one-off custom material lists.
- Finished-goods inventory.
- Sales records with revenue, cost, profit, and profit margin.
- Reports by sale, by style, and by month.
- Images for materials, styles, finished goods, and optional sales references.

Version 1 excludes:

- Login and multi-user permissions.
- Cloud sync.
- Supplier management beyond optional notes.
- Customer membership management.
- Store platform integrations.
- Full accounting ledgers.
- Barcode or QR-code workflows.

## Data Storage

The first version will be a local web app with data saved in the browser. This keeps setup simple and lets the user start quickly.

Images will be stored as compressed preview images in local browser data. Uploaded images should be resized to a practical preview size, such as a maximum width of 800 pixels, to avoid making the app slow or bloated. If the image library grows later, the system can be upgraded to store image files in a local `uploads/` folder.

## Core Records

### Materials

Each material represents one inventory item counted by pieces.

Fields:

- Name
- Category: crystal bead, spacer, charm, string, packaging, other
- Size or specification
- Current quantity
- Total remaining cost
- Average unit cost
- Low-stock threshold
- Image
- Notes

All material inventory is counted by piece/item. If the user buys a strand or package, they should enter the total number of usable pieces.

### Purchases

Each purchase records added material stock.

Fields:

- Material
- Quantity
- Total cost
- Purchase date
- Notes

Saving a purchase increases material quantity and updates weighted-average cost:

```text
new average unit cost =
  (old remaining total cost + purchase total cost)
  / (old quantity + purchase quantity)
```

### Recipes And Styles

A recipe/style represents a repeatable bracelet design.

Fields:

- Style name
- Material lines: material, quantity per bracelet
- Default packaging cost per bracelet
- Default labor cost per bracelet
- Suggested sale price
- Style image
- Notes

The app should calculate estimated material cost, total estimated cost, estimated profit, and estimated profit margin from the current average material costs.

### Production

Production creates finished goods and deducts material inventory.

There are two production modes:

- Recipe production: choose a saved style and production quantity.
- Custom production: choose materials manually for a one-off or custom order.

Fields:

- Production date
- Style, if based on a recipe
- Custom name, if not based on a recipe
- Material lines
- Quantity made
- Packaging cost per bracelet
- Labor cost per bracelet
- Finished-goods image
- Notes

When production is saved:

- The app checks that each material has enough inventory.
- The app deducts material quantities.
- The app deducts material costs from material remaining total cost using current average unit cost.
- The app creates a finished-goods batch with quantity made, quantity remaining, and unit cost.

Finished-goods unit cost:

```text
finished unit cost =
  material cost per bracelet
  + packaging cost per bracelet
  + labor cost per bracelet
```

### Finished Goods

Finished goods are stored by production batch.

Fields:

- Style or custom name
- Source production record
- Quantity made
- Quantity remaining
- Unit cost
- Production date
- Image
- Notes

Sales reduce quantity remaining from selected finished-goods batches.

### Sales

Each sale records finished goods sold.

Fields:

- Sale date
- Finished-goods batch
- Style or custom name
- Quantity sold
- Sale price per bracelet
- Total revenue
- Unit cost
- Total cost
- Profit
- Profit margin
- Channel or customer note
- Optional sale/reference image
- Notes

Profit calculation:

```text
total revenue = quantity sold * sale price per bracelet
total cost = quantity sold * finished unit cost
profit = total revenue - total cost
profit margin = profit / total revenue
```

## Reports

The first version should include three report views.

### Sales Detail

Shows each sale with date, product, quantity, revenue, cost, profit, and profit margin.

### Style Summary

Groups sales by style/custom name and shows:

- Quantity sold
- Total revenue
- Total cost
- Total profit
- Average profit margin

### Monthly Summary

Groups sales by month and shows:

- Monthly revenue
- Monthly cost
- Monthly profit
- Average profit margin

## Interface Shape

The app should use simple operational screens rather than a marketing-style layout.

Primary navigation:

- Dashboard
- Materials
- Purchases
- Recipes
- Production
- Finished Goods
- Sales
- Reports

Dashboard should show quick totals:

- Current material inventory value
- Finished-goods inventory value
- Total sales revenue
- Total profit
- Low-stock materials

Tables should support scanning and simple filtering. Forms should guide the user through the required fields and show calculated cost/profit before saving.

## Validation And Error Handling

The app should prevent invalid inventory operations:

- Purchase quantity and total cost must be positive.
- Production cannot save if material stock is insufficient.
- Sale cannot save if finished-goods stock is insufficient.
- Sale price must be positive.
- Image upload should reject unsupported file types and handle oversized images by resizing where possible.

If a user tries an invalid action, the app should show a clear message and keep the entered form values.

## Testing Focus

Core tests should cover:

- Weighted-average cost updates after purchases.
- Material stock and remaining cost deductions after production.
- Finished-goods creation from recipe and custom production.
- Sale stock deduction.
- Profit and margin calculations.
- Monthly and style report aggregation.
- Image resizing/storage behavior at a basic level.

## Future Extensions

Possible later improvements:

- Export to Excel or CSV.
- Import existing material lists.
- Store images in a local `uploads/` folder.
- Supplier list.
- Customer list.
- Product photo gallery.
- Cloud backup or sync.
- More detailed expense tracking.
