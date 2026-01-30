import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Get all products for a shop
router.get("/shop/:shopDID", async (req, res) => {
  try {
    const { shopDID } = req.params;
    const { category, search, activeOnly } = req.query;

    const query = { shopDID };

    if (category && category !== "all") {
      query.category = category;
    }

    if (activeOnly === "true") {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ name: 1 });
    res.json(products);
  } catch (err) {
    console.error("[products] get shop products error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get product categories for a shop
router.get("/shop/:shopDID/categories", async (req, res) => {
  try {
    const { shopDID } = req.params;
    const categories = await Product.distinct("category", { shopDID });
    res.json(categories);
  } catch (err) {
    console.error("[products] get categories error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single product
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("[products] get product error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new product
router.post("/", async (req, res) => {
  try {
    const {
      shopDID,
      name,
      price,
      sku,
      category,
      description,
      unit,
      metadata,
      trackInventory,
      currentStock,
    } = req.body;

    if (!shopDID || !name || typeof price !== "number") {
      return res.status(400).json({
        message: "shopDID, name, and price are required",
      });
    }

    // Generate unique product ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const productId = `PROD-${timestamp}-${random}`;

    const product = await Product.create({
      productId,
      shopDID,
      name,
      price,
      sku: sku || "",
      category: category || "General",
      description: description || "",
      unit: unit || "piece",
      metadata: metadata || {},
      trackInventory: trackInventory || false,
      currentStock: currentStock || 0,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("[products] create error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update product
router.put("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    // Don't allow changing productId or shopDID
    delete updates.productId;
    delete updates.shopDID;

    const product = await Product.findOneAndUpdate(
      { productId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("[products] update error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete product (soft delete - set isActive to false)
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { permanent } = req.query;

    if (permanent === "true") {
      // Permanent delete
      const product = await Product.findOneAndDelete({ productId });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    } else {
      // Soft delete
      const product = await Product.findOneAndUpdate(
        { productId },
        { $set: { isActive: false } },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("[products] delete error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update product stock
router.patch("/:productId/stock", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, operation } = req.body;

    if (typeof quantity !== "number") {
      return res.status(400).json({ message: "Quantity must be a number" });
    }

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.trackInventory) {
      return res.status(400).json({ message: "Product does not track inventory" });
    }

    let newStock = product.currentStock;
    if (operation === "add") {
      newStock += quantity;
    } else if (operation === "subtract") {
      newStock -= quantity;
      if (newStock < 0) newStock = 0;
    } else if (operation === "set") {
      newStock = quantity;
    }

    product.currentStock = newStock;
    await product.save();

    res.json(product);
  } catch (err) {
    console.error("[products] update stock error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
