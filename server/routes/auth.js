import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Customer from "../models/Customer.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "loyvault-dev-secret";

router.post("/register", async (req, res) => {
  try {
    const { email, password, did } = req.body;
    if (!email || !password || !did) {
      return res.status(400).json({ message: "email, password and did are required" });
    }

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Customer already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await Customer.create({ email, passwordHash, did });

    const token = jwt.sign({ id: customer._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      customer: {
        id: customer._id,
        email: customer.email,
        did: customer.did,
      },
    });
  } catch (err) {
    console.error("[auth] register error", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: customer._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      customer: {
        id: customer._id,
        email: customer.email,
        did: customer.did,
      },
    });
  } catch (err) {
    console.error("[auth] login error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
