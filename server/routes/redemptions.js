import express from "express";
import OfferRedemption from "../models/OfferRedemption.js";

const router = express.Router();

// Mark an offer as redeemed for a specific customer
router.post("/redeem", async (req, res) => {
  try {
    const { customerDID, offerID, shopDID } = req.body;
    
    if (!customerDID || !offerID || !shopDID) {
      return res.status(400).json({ message: "customerDID, offerID, and shopDID are required" });
    }

    // Check if already redeemed
    let redemption = await OfferRedemption.findOne({ customerDID, offerID });
    
    if (redemption) {
      // Increment redemption count
      redemption.redemptionCount += 1;
      redemption.redeemedAt = new Date();
      await redemption.save();
    } else {
      // Create new redemption record
      redemption = await OfferRedemption.create({
        customerDID,
        offerID,
        shopDID,
        redemptionCount: 1,
      });
    }

    res.json(redemption);
  } catch (err) {
    console.error("[redemptions] redeem error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all redemptions for a customer
router.get("/customer/:customerDID", async (req, res) => {
  try {
    const { customerDID } = req.params;
    
    if (!customerDID) {
      return res.status(400).json({ message: "customerDID is required" });
    }

    const redemptions = await OfferRedemption.find({ customerDID });
    res.json(redemptions);
  } catch (err) {
    console.error("[redemptions] customer redemptions error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Check if a specific offer is redeemed by a customer
router.get("/check/:customerDID/:offerID", async (req, res) => {
  try {
    const { customerDID, offerID } = req.params;
    
    const redemption = await OfferRedemption.findOne({ customerDID, offerID });
    
    res.json({
      redeemed: !!redemption,
      redemptionCount: redemption ? redemption.redemptionCount : 0,
      redeemedAt: redemption ? redemption.redeemedAt : null,
    });
  } catch (err) {
    console.error("[redemptions] check error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get redemption stats for a shop
router.get("/shop/:shopDID/stats", async (req, res) => {
  try {
    const { shopDID } = req.params;
    
    const totalRedemptions = await OfferRedemption.countDocuments({ shopDID });
    const uniqueCustomers = await OfferRedemption.distinct("customerDID", { shopDID });
    
    res.json({
      totalRedemptions,
      uniqueCustomers: uniqueCustomers.length,
    });
  } catch (err) {
    console.error("[redemptions] shop stats error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
