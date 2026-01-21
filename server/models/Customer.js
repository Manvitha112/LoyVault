import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    // For DID-only customers created via join-by-did, passwordHash can be empty for now
    passwordHash: { type: String, default: "" },
    did: { type: String, required: true },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
