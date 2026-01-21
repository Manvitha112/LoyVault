import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    shopDID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
