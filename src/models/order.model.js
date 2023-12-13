"use strict";

const { Schema, Types, model } = require("mongoose"); // Erase if already required
const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "order";

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    checkout: {
      totalPrice: Number,
      shipFee: Number,
    },
    book: [
      {
        bookId: { type: Types.ObjectId, ref: "Book" },
        quantity: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "DELIVERED",
        "CANCELED",
        "REJECTED",
        "SHIPPING",
        "RETURN",
      ],
    },
    cancel: {
      reason: String,
      canceledAt: Date,
    },
    return: {
      returnedAt: Date,
      reason: String,
    },
    reject: {
      rejectedAt: Date,
      reason: String,
    },
    confirmAt: Date,
    deliveredAt: Date,
    shippingAt: Date,
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

orderSchema.index({ book: 1, userId: 1 });

//Export the model
module.exports = model(DOCUMENT_NAME, orderSchema);
