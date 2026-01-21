import mongoose from "mongoose";

const loyaltyProgramSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    shopDID: { type: String, required: true },
    shopName: { type: String, required: true },
    points: { type: Number, default: 0 },
    tier: { type: String, default: "Base" },
    issuedDate: { type: Date, default: Date.now },
    signature: { type: String },
  },
  { timestamps: true }
);

const LoyaltyProgram = mongoose.model("LoyaltyProgram", loyaltyProgramSchema);

export default LoyaltyProgram;
