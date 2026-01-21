import express from "express";

import LoyaltyProgram from "../models/LoyaltyProgram.js";
import Shop from "../models/Shop.js";
import Customer from "../models/Customer.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// -----------------------------
// Auth-based endpoints (for future use)
// -----------------------------

// Get all loyalty programs for logged-in customer
router.get("/", requireAuth, async (req, res) => {
  try {
    const programs = await LoyaltyProgram.find({ customer: req.userId }).sort({ createdAt: -1 });
    res.json(programs);
  } catch (err) {
    console.error("[loyalty] list error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Join or upsert a loyalty program when customer scans a join QR
router.post("/join", requireAuth, async (req, res) => {
  try {
    const { shopDID, shopName, points = 0, tier = "Base", issuedDate, signature } = req.body;
    if (!shopDID || !shopName) {
      return res.status(400).json({ message: "shopDID and shopName are required" });
    }

    let shop = await Shop.findOne({ shopDID });
    if (!shop) {
      shop = await Shop.create({ shopDID, name: shopName });
    }

    const existing = await LoyaltyProgram.findOne({ customer: req.userId, shop: shop._id });

    let program;
    if (existing) {
      existing.points = points ?? existing.points;
      existing.tier = tier ?? existing.tier;
      if (issuedDate) existing.issuedDate = issuedDate;
      if (signature) existing.signature = signature;
      program = await existing.save();
    } else {
      program = await LoyaltyProgram.create({
        customer: req.userId,
        shop: shop._id,
        shopDID,
        shopName,
        points,
        tier,
        issuedDate: issuedDate || new Date(),
        signature,
      });
    }

    res.status(201).json(program);
  } catch (err) {
    console.error("[loyalty] join error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update points after shop verification
router.post("/update-points", requireAuth, async (req, res) => {
  try {
    const { shopDID, points, tier } = req.body;
    if (!shopDID || typeof points !== "number") {
      return res.status(400).json({ message: "shopDID and numeric points are required" });
    }

    const shop = await Shop.findOne({ shopDID });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const program = await LoyaltyProgram.findOne({ customer: req.userId, shop: shop._id });
    if (!program) {
      return res.status(404).json({ message: "Loyalty program not found" });
    }

    program.points = points;
    if (tier) program.tier = tier;
    await program.save();

    res.json(program);
  } catch (err) {
    console.error("[loyalty] update-points error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// DID-based endpoints (used by current frontend, no JWT auth)
// -----------------------------

// Get loyalty programs for a customer DID
router.get("/by-did/:did", async (req, res) => {
  try {
    const { did } = req.params;
    if (!did) {
      return res.status(400).json({ message: "DID is required" });
    }

    const customer = await Customer.findOne({ did });
    if (!customer) {
      return res.json([]);
    }

    const programs = await LoyaltyProgram.find({ customer: customer._id }).sort({ createdAt: -1 });
    res.json(programs);
  } catch (err) {
    console.error("[loyalty] by-did error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Join or upsert a loyalty program by customer DID (no JWT yet)
router.post("/join-by-did", async (req, res) => {
  try {
    const { did, shopDID, shopName, points = 0, tier = "Base", issuedDate, signature } = req.body;
    if (!did || !shopDID || !shopName) {
      return res.status(400).json({ message: "did, shopDID and shopName are required" });
    }

    let customer = await Customer.findOne({ did });
    if (!customer) {
      customer = await Customer.create({
        email: `${did}@loyvault.local`,
        passwordHash: "", // placeholder; DID-based, no password for now
        did,
      });
    }

    let shop = await Shop.findOne({ shopDID });
    if (!shop) {
      shop = await Shop.create({ shopDID, name: shopName });
    }

    const existing = await LoyaltyProgram.findOne({ customer: customer._id, shop: shop._id });

    let program;
    if (existing) {
      existing.points = points ?? existing.points;
      existing.tier = tier ?? existing.tier;
      if (issuedDate) existing.issuedDate = issuedDate;
      if (signature) existing.signature = signature;
      program = await existing.save();
    } else {
      program = await LoyaltyProgram.create({
        customer: customer._id,
        shop: shop._id,
        shopDID,
        shopName,
        points,
        tier,
        issuedDate: issuedDate || new Date(),
        signature,
      });
    }

    res.status(201).json(program);
  } catch (err) {
    console.error("[loyalty] join-by-did error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update points for a customer + shop by DID
router.post("/update-points-by-did", async (req, res) => {
  try {
    const { did, shopDID, points, tier } = req.body;
    if (!did || !shopDID || typeof points !== "number") {
      return res.status(400).json({ message: "did, shopDID and numeric points are required" });
    }

    const customer = await Customer.findOne({ did });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const shop = await Shop.findOne({ shopDID });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const program = await LoyaltyProgram.findOne({ customer: customer._id, shop: shop._id });
    if (!program) {
      return res.status(404).json({ message: "Loyalty program not found" });
    }

    program.points = points;
    if (tier) program.tier = tier;
    await program.save();

    res.json(program);
  } catch (err) {
    console.error("[loyalty] update-points-by-did error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// Shop stats (for dashboard)
// -----------------------------

// Get loyalty stats for a given shopDID
router.get("/stats/:shopDID", async (req, res) => {
  try {
    const { shopDID } = req.params;
    if (!shopDID) {
      return res.status(400).json({ message: "shopDID is required" });
    }

    const shop = await Shop.findOne({ shopDID });
    if (!shop) {
      return res.json({
        totalMembers: 0,
        pointsDistributed: 0,
        todayJoins: 0,
      });
    }

    const programs = await LoyaltyProgram.find({ shop: shop._id });

    const totalMembers = programs.length;
    const pointsDistributed = programs.reduce(
      (sum, p) => sum + (typeof p.points === "number" ? p.points : 0),
      0
    );

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayJoins = programs.filter(
      (p) => p.createdAt && p.createdAt >= startOfToday
    ).length;

    res.json({ totalMembers, pointsDistributed, todayJoins });
  } catch (err) {
    console.error("[loyalty] stats error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
