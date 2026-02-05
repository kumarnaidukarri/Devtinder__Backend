// 'Schema' defines what properties/attributes do our Payment 'collection' have.  i.e, it contains User Payments data.
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User", // refers to the 'User' Collection
      required: true,
    },
    paymentId: { type: String },
    orderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: { type: String, required: true },
    receipt: {
      type: String,
      required: true,
    },
    notes: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      membershipType: {
        type: String,
      },
    },
  },
  { timestamps: true },
);

// to use a Schema, we need a 'Model'
const paymentModel = mongoose.model("Payment", paymentSchema);

module.exports = paymentModel;
