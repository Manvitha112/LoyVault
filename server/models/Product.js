import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    shopDID: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    unit: {
      type: String,
      trim: true,
      default: "piece",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    trackInventory: {
      type: Boolean,
      default: false,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ shopDID: 1, name: 1 });
productSchema.index({ shopDID: 1, category: 1 });
productSchema.index({ shopDID: 1, isActive: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
