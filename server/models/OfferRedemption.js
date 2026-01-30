import mongoose from "mongoose";

const offerRedemptionSchema = new mongoose.Schema(
  {
    customerDID: { type: String, required: true, index: true },
    offerID: { type: String, required: true, index: true },
    shopDID: { type: String, required: true },
    redeemedAt: { type: Date, default: Date.now },
    redemptionCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Compound index to ensure one redemption record per customer per offer
offerRedemptionSchema.index({ customerDID: 1, offerID: 1 }, { unique: true });

const OfferRedemption = mongoose.model("OfferRedemption", offerRedemptionSchema);

export default OfferRedemption;
