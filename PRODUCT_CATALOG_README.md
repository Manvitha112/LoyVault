# Universal Product Catalog System

## Overview
A flexible product management system that works for ANY type of shop - coffee shops, medical stores, clothing stores, electronics, groceries, and more.

## Features Implemented

### Backend
- **Product Model** (`server/models/Product.js`)
  - Universal schema with flexible fields
  - Support for any shop type
  - Optional inventory tracking
  - Flexible metadata for shop-specific attributes
  
- **Product API Routes** (`server/routes/products.js`)
  - GET `/api/products/shop/:shopDID` - Get all products for a shop
  - GET `/api/products/shop/:shopDID/categories` - Get product categories
  - GET `/api/products/:productId` - Get single product
  - POST `/api/products` - Create new product
  - PUT `/api/products/:productId` - Update product
  - DELETE `/api/products/:productId` - Delete product (soft delete)
  - PATCH `/api/products/:productId/stock` - Update inventory

### Frontend
- **ProductManagement Component** (`src/components/shopkeeper/ProductManagement.jsx`)
  - Add/Edit/Delete products
  - Search and filter by category
  - Product cards with details
  - Modal form for product entry
  - Inventory tracking option
  
- **Navigation Integration**
  - Added "Products" tab to Shopkeeper Dashboard
  - Accessible from sidebar menu

## Product Schema

```javascript
{
  productId: String,        // Auto-generated unique ID
  shopDID: String,          // Shop identifier
  name: String,             // Product name (required)
  price: Number,            // Price (required)
  sku: String,              // SKU/Code (optional)
  category: String,         // Category (default: "General")
  description: String,      // Description (optional)
  unit: String,             // Unit (piece/kg/liter/etc.)
  metadata: Object,         // Flexible shop-specific data
  trackInventory: Boolean,  // Enable inventory tracking
  currentStock: Number,     // Current stock level
  isActive: Boolean,        // Active status
  createdAt: Date,          // Created timestamp
  updatedAt: Date           // Updated timestamp
}
```

## Usage Examples

### Coffee Shop
```javascript
{
  name: "Cappuccino",
  price: 150,
  category: "Beverages",
  unit: "cup",
  metadata: { size: "Regular", temperature: "Hot" }
}
```

### Medical Store
```javascript
{
  name: "Paracetamol 500mg",
  price: 50,
  category: "Medicines",
  unit: "strip",
  sku: "MED-PAR-500",
  metadata: { dosage: "500mg", manufacturer: "ABC Pharma" }
}
```

### Clothing Store
```javascript
{
  name: "Blue Jeans",
  price: 1200,
  category: "Men's Wear",
  unit: "piece",
  metadata: { size: "32", color: "Blue", material: "Denim" }
}
```

## How to Use

### For Shopkeepers

1. **Access Product Catalog**
   - Login to shopkeeper dashboard
   - Click "Products" in sidebar menu

2. **Add Products**
   - Click "Add Product" button
   - Fill in product details:
     - Name (required)
     - Price (required)
     - Category (optional)
     - Unit (piece, kg, liter, etc.)
     - Description (optional)
     - SKU/Code (optional)
   - Enable inventory tracking if needed
   - Click "Add Product"

3. **Manage Products**
   - Search products by name/SKU
   - Filter by category
   - Edit product details
   - Delete products (soft delete)
   - Update stock levels

4. **Use in Invoices** (Coming Next)
   - Select products when creating invoices
   - Automatic price calculation
   - Line items in bills

## API Client Functions

```javascript
// Fetch all products for a shop
fetchShopProducts(shopDID, { category, search, activeOnly })

// Get product categories
fetchProductCategories(shopDID)

// Create new product
createProduct(productData)

// Update product
updateProduct(productId, updates)

// Delete product
deleteProduct(productId, permanent)

// Update stock
updateProductStock(productId, quantity, operation)
```

## Next Steps

1. **Integrate with Invoice Creation**
   - Add product selector to VerifyCustomer component
   - Allow selecting products when creating invoices
   - Auto-populate line items with product details
   - Calculate totals automatically

2. **Enhanced Features** (Optional)
   - Barcode scanning
   - Product variants (sizes, colors)
   - Bulk import/export
   - Sales analytics by product
   - Low stock alerts

## Testing

1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   ```

3. **Test Product Management**
   - Login as shopkeeper
   - Go to Products tab
   - Add sample products
   - Test search and filters
   - Edit and delete products

## Notes

- Products are shop-specific (isolated by shopDID)
- Soft delete keeps products in database but marks as inactive
- Flexible metadata allows any shop type to add custom fields
- Unit field supports various measurement types
- Inventory tracking is optional per product
- Categories are dynamic (created by shops)

## Database Collections

- **products** - Stores all product data
  - Indexed by: shopDID, name, category, isActive
  - Timestamps: createdAt, updatedAt

## Files Modified/Created

### Backend
- ✅ `server/models/Product.js` - Product model
- ✅ `server/routes/products.js` - Product API routes
- ✅ `server/server.js` - Registered product routes

### Frontend
- ✅ `src/utils/apiClient.js` - Added product API functions
- ✅ `src/components/shopkeeper/ProductManagement.jsx` - Product management UI
- ✅ `src/components/shopkeeper/Sidebar.jsx` - Added Products menu item
- ✅ `src/pages/ShopDashboard.jsx` - Integrated ProductManagement component

## Status

✅ **Backend Complete** - Product model and API routes working
✅ **Frontend Complete** - Product management UI implemented
✅ **Navigation Complete** - Products tab added to dashboard
⏳ **Invoice Integration** - Next phase (optional)

---

**The universal product catalog system is now ready to use for any shop type!**
