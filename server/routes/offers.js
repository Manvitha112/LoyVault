import express from "express";

import Offer from "../models/Offer.js";
import Shop from "../models/Shop.js";
import Customer from "../models/Customer.js";
import LoyaltyProgram from "../models/LoyaltyProgram.js";

const router = express.Router();

// Create or update an offer for a shop
router.post("/", async (req, res) => {
  try {
    const {
      shopDID,
      shopName,
      title,
      description,
      offerType = "NORMAL",
      discountValue,
      minTier = "Base",
      minPurchase = 0,
      startDate,
      endDate,
      maxRedemptionsPerCustomer,
    } = req.body || {};

    if (!shopDID || !shopName || !title || typeof discountValue !== "number") {
      return res.status(400).json({ message: "shopDID, shopName, title and numeric discountValue are required" });
    }

    let shop = await Shop.findOne({ shopDID });
    if (!shop) {
      shop = await Shop.create({ shopDID, name: shopName });
    }

    const offer = await Offer.create({
      shop: shop._id,
      shopDID,
      shopName,
      title,
      description,
      offerType,
      discountValue,
      minTier,
      minPurchase,
      startDate,
      endDate,
      maxRedemptionsPerCustomer,
    });

    res.status(201).json(offer);
  } catch (err) {
    console.error("[offers] create error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Simple stats for a shop's offers
router.get("/stats/:shopDID", async (req, res) => {
  try {
    const { shopDID } = req.params;
    if (!shopDID) {
      return res.status(400).json({ message: "shopDID is required" });
    }

    const shop = await Shop.findOne({ shopDID });
    if (!shop) {
      return res.json({ activeOffers: 0 });
    }

    const now = new Date();
    const activeOffers = await Offer.countDocuments({
      shop: shop._id,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: now } },
      ],
    });

    res.json({ activeOffers });
  } catch (err) {
    console.error("[offers] stats error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get offers for a customer based on their joined loyalty programs
router.get("/for-did/:did", async (req, res) => {
  try {
    const { did } = req.params;
    console.log("[offers] for-did request for DID:", did);
    
    if (!did) {
      return res.status(400).json({ message: "Customer DID is required" });
    }

    // Find all loyalty programs this customer has joined
    const loyaltyPrograms = await LoyaltyProgram.find({ did });
    console.log("[offers] Found loyalty programs:", loyaltyPrograms.length);
    
    if (!loyaltyPrograms || loyaltyPrograms.length === 0) {
      console.log("[offers] No loyalty programs found for DID:", did);
      return res.json([]);
    }

    // Extract shopDIDs from the loyalty programs
    const shopDIDs = loyaltyPrograms.map(lp => lp.shopDID);
    console.log("[offers] Shop DIDs:", shopDIDs);

    // Find active offers from those shops only
    const now = new Date();
    const offers = await Offer.find({
      shopDID: { $in: shopDIDs },
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: now } },
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    console.log("[offers] Found offers:", offers.length);
    res.json(offers);
  } catch (err) {
    console.error("[offers] for-did error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
