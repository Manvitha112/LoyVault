import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    shopDID: {
      type: String,
      required: true,
      index: true,
    },
    customerDID: {
      type: String,
      required: true,
      index: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    shopName: {
      type: String,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    pointsAdded: {
      type: Number,
      default: 0,
    },
    tierAfter: {
      type: String,
      default: "Base",
    },
    lineItems: [
      {
        name: String,
        quantity: Number,
        price: Number,
        total: Number,
      },
    ],
    notes: String,
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
