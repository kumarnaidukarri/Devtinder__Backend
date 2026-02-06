const express = require("express");
const paymentRouter = express.Router(); // payment router

const { userAuth } = require("../middlewares/auth.js"); //Authentication Middleware
const paymentModel = require("../models/payment.js"); //payment DB model
const { membershipAmount } = require("../utils/constants.js"); // constants
const razorpayInstance = require("../utils/razorpay.js"); //Razorpay integration Module

// Create Order API
paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body; // "gold" or "silver"
    const { firstName, lastName, emailId } = req.user;

    // 1. Razorpay will create an 'order' in Razorpay Server and returns Promise
    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100, // Rupees
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        // Meta data about Payment
        firstName: firstName,
        lastName: lastName,
        membershipType: membershipType,
      },
    });

    // 2. Save it in Database
    console.log(order);
    // creating a new document instance using Payment model
    const payment = new paymentModel({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });
    const savedPayment = await payment.save(); // Saves in DB

    // 3. Return the 'Order details' to Frontend.
    res.json({
      ...savedPayment.toJSON(),
      razorpayKeyId: process.env.RAZORPAY_KEY_ID, // Frontend need this 'Razorpay Key Id' to open 'Razorpay Payment Dialog Checkout Box'.
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = paymentRouter;
