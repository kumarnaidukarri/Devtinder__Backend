const express = require("express");
const paymentRouter = express.Router(); // payment router

const { userAuth } = require("../middlewares/auth.js"); //Authentication Middleware
const razorpayInstance = require("../utils/razorpay.js"); //Razorpay integration Module

// Create Order API
paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    // 1. Razorpay will create an 'order' in Razorpay Server and returns Promise
    const order = await razorpayInstance.order.create({
      amount: 5000, // 5000 Paisa
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        // Meta data about Payment
        firstName: "value3",
        lastName: "value2",
        membershipType: "silver",
      },
    });

    // 2. Save it in Database
    console.log(order);

    // 3. Return the 'Order details' to Frontend.
    res.json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = paymentRouter;
