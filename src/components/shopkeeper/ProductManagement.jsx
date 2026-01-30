import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Edit2, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchShopProducts,
  fetchProductCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../utils/apiClient.js";

const ProductManagement = ({ shop }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (shop?.shopDID) {
      loadProducts();
      loadCategories();
    }
  }, [shop?.shopDID]);

  const loadProducts = async () => {
    try {
      const data = await fetchShopProducts(shop.shopDID, {
        search: searchTerm,
        category: selectedCategory === "all" ? "" : selectedCategory,
        activeOnly: true,
      });
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchProductCategories(shop.shopDID);
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setTimeout(() => loadProducts(), 0);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      loadProducts();
      loadCategories();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.productId, productData);
        toast.success("Product updated successfully");
      } else {
        await createProduct({ ...productData, shopDID: shop.shopDID });
        toast.success("Product added successfully");
      }
      setShowAddModal(false);
      loadProducts();
      loadCategories();
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Failed to save product");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-purple-300">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Product Catalog</h1>
          <p className="text-purple-300">Manage your shop's products</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-purple-400/30 bg-white/10 p-4 backdrop-blur-lg md:flex-row">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 rounded-lg border border-purple-400/30 bg-white/10 px-4 py-2 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="rounded-lg border border-purple-400/30 bg-slate-800 px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
          style={{ colorScheme: 'dark' }}
        >
          <option value="all" className="bg-slate-800 text-white">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-slate-800 text-white">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-purple-400/30 bg-white/10 p-12 text-center backdrop-blur-lg">
          <Package className="mx-auto mb-6 h-24 w-24 text-purple-400/50" />
          <h2 className="mb-4 text-2xl font-bold text-white">No Products Yet</h2>
          <p className="mx-auto mb-6 max-w-md text-purple-300">
            Start building your product catalog by adding your first product.
          </p>
          <button
            onClick={handleAddProduct}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105"
          >
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

const ProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <div className="rounded-xl border border-purple-400/30 bg-white/10 p-4 backdrop-blur-lg transition-all hover:bg-white/15">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-bold text-white">{product.name}</h3>
          <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
            {product.category}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="rounded-lg bg-blue-500/20 p-2 text-blue-300 hover:bg-blue-500/30"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(product.productId)}
            className="rounded-lg bg-red-500/20 p-2 text-red-300 hover:bg-red-500/30"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-3 text-2xl font-bold text-white">
        ₹{product.price.toLocaleString()}
        {product.unit && product.unit !== "piece" && (
          <span className="ml-1 text-sm text-purple-300">/ {product.unit}</span>
        )}
      </div>

      {product.description && (
        <p className="mb-3 text-sm text-purple-300 line-clamp-2">
          {product.description}
        </p>
      )}

      {product.sku && (
        <div className="text-xs text-purple-400">SKU: {product.sku}</div>
      )}

      {product.trackInventory && (
        <div className="mt-2 text-xs text-purple-400">
          Stock: {product.currentStock} {product.unit}
        </div>
      )}
    </div>
  );
};

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price || "",
    category: product?.category || "General",
    sku: product?.sku || "",
    description: product?.description || "",
    unit: product?.unit || "piece",
    trackInventory: product?.trackInventory || false,
    currentStock: product?.currentStock || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error("Name and price are required");
      return;
    }
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      currentStock: parseInt(formData.currentStock) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-900 to-slate-900 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-purple-300 hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-purple-400/30 bg-white/10 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
              placeholder="e.g., Cappuccino, Paracetamol, Blue Jeans"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-300">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-lg border border-purple-400/30 bg-white/10 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-300">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-lg border border-purple-400/30 bg-slate-800 px-4 py-3 text-white focus:border-purple-400 focus:outline-none"
                style={{ colorScheme: 'dark' }}
              >
                <option value="piece" className="bg-slate-800 text-white">Piece</option>
                <option value="kg" className="bg-slate-800 text-white">Kilogram (kg)</option>
                <option value="gram" className="bg-slate-800 text-white">Gram (g)</option>
                <option value="liter" className="bg-slate-800 text-white">Liter (L)</option>
                <option value="ml" className="bg-slate-800 text-white">Milliliter (ml)</option>
                <option value="box" className="bg-slate-800 text-white">Box</option>
                <option value="packet" className="bg-slate-800 text-white">Packet</option>
                <option value="bottle" className="bg-slate-800 text-white">Bottle</option>
                <option value="cup" className="bg-slate-800 text-white">Cup</option>
                <option value="plate" className="bg-slate-800 text-white">Plate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-300">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-purple-400/30 bg-white/10 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
                placeholder="e.g., Beverages, Medicine, Clothing"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-purple-300">
                SKU / Code
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full rounded-lg border border-purple-400/30 bg-white/10 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-purple-400/30 bg-white/10 px-4 py-3 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
              placeholder="Optional product description"
              rows="3"
            />
          </div>

          <div className="rounded-lg border border-purple-400/30 bg-white/5 p-4">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-purple-300">
              <input
                type="checkbox"
                checked={formData.trackInventory}
                onChange={(e) =>
                  setFormData({ ...formData, trackInventory: e.target.checked })
                }
                className="h-4 w-4 rounded border-purple-400/30"
              />
              Track Inventory
            </label>
            {formData.trackInventory && (
              <div>
                <label className="mb-2 block text-sm text-purple-300">
                  Current Stock
                </label>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({ ...formData, currentStock: e.target.value })
                  }
                  className="w-full rounded-lg border border-purple-400/30 bg-white/10 px-4 py-2 text-white focus:border-purple-400 focus:outline-none"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-purple-400/30 py-3 font-semibold text-purple-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-semibold text-white hover:scale-105"
            >
              {product ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagement;
