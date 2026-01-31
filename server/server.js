import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import loyaltyRoutes from "./routes/loyalty.js";
import offerRoutes from "./routes/offers.js";
import invoiceRoutes from "./routes/invoices.js";
import redemptionRoutes from "./routes/redemptions.js";
import productRoutes from "./routes/products.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 10000;
const MONGODB_URI = process.env.MONGODB_URI ;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/loyalty-programs", loyaltyRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/redemptions", redemptionRoutes);
app.use("/api/products", productRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("[LoyVault] Connected to MongoDB");
    app.listen(PORT, "0.0.0.0",() => {
      console.log(`[LoyVault] API server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[LoyVault] Failed to connect to MongoDB", err);
    process.exit(1);
  });
