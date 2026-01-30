import express from "express";
import Invoice from "../models/Invoice.js";
import Shop from "../models/Shop.js";

const router = express.Router();

// Get shop details for bill generation
router.get("/shop-details/:shopDID", async (req, res) => {
  try {
    const { shopDID } = req.params;
    const shop = await Shop.findOne({ shopDID });
    
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    
    res.json({
      shopName: shop.name,
      address: shop.address || "",
      gstNumber: shop.gstNumber || "",
      phone: shop.phone || "",
      email: shop.email || "",
    });
  } catch (err) {
    console.error("[invoices] shop-details error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new invoice
router.post("/", async (req, res) => {
  try {
    const {
      shopDID,
      customerDID,
      shopName,
      subtotal,
      tax = 0,
      total,
      pointsAdded = 0,
      tierAfter = "Base",
      lineItems = [],
      notes = "",
    } = req.body;

    if (!shopDID || !customerDID || !shopName || typeof total !== "number") {
      return res.status(400).json({
        message: "shopDID, customerDID, shopName, and total are required",
      });
    }

    // Generate unique transaction ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const transactionId = `INV-${timestamp}-${random}`;

    // Find or create shop reference
    let shop = await Shop.findOne({ shopDID });
    if (!shop) {
      shop = await Shop.create({ shopDID, name: shopName });
    }

    const invoice = await Invoice.create({
      transactionId,
      shopDID,
      customerDID,
      shop: shop._id,
      shopName,
      subtotal: subtotal || total,
      tax,
      total,
      pointsAdded,
      tierAfter,
      lineItems,
      notes,
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error("[invoices] create error", err);
    res.status(500).json({ message: "Server error creating invoice" });
  }
});

// Get invoices for a specific customer by DID
router.get("/for-customer/:did", async (req, res) => {
  try {
    const { did } = req.params;
    if (!did) {
      return res.status(400).json({ message: "Customer DID is required" });
    }

    const invoices = await Invoice.find({ customerDID: did })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(invoices);
  } catch (err) {
    console.error("[invoices] for-customer error", err);
    res.status(500).json({ message: "Server error fetching invoices" });
  }
});

// Get invoices for a specific shop by shopDID
router.get("/for-shop/:shopDID", async (req, res) => {
  try {
    const { shopDID } = req.params;
    if (!shopDID) {
      return res.status(400).json({ message: "Shop DID is required" });
    }

    const invoices = await Invoice.find({ shopDID })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(invoices);
  } catch (err) {
    console.error("[invoices] for-shop error", err);
    res.status(500).json({ message: "Server error fetching shop invoices" });
  }
});

// Get invoice stats for shop dashboard
router.get("/stats/:shopDID", async (req, res) => {
  try {
    const { shopDID } = req.params;
    if (!shopDID) {
      return res.status(400).json({ message: "Shop DID is required" });
    }

    const totalInvoices = await Invoice.countDocuments({ shopDID });
    
    const revenueResult = await Invoice.aggregate([
      { $match: { shopDID } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({ totalInvoices, totalRevenue });
  } catch (err) {
    console.error("[invoices] stats error", err);
    res.status(500).json({ message: "Server error fetching invoice stats" });
  }
});

export default router;
