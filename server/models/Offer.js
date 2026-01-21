import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    shopDID: { type: String, required: true },
    shopName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    offerType: { type: String, enum: ["NORMAL", "SPECIAL"], default: "NORMAL" },
    discountValue: { type: Number, required: true },
    minTier: { type: String, default: "Base" },
    minPurchase: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    maxRedemptionsPerCustomer: { type: Number },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
