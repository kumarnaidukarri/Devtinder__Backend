const express = require("express");
const paymentRouter = express.Router(); // payment router
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils"); // Webhook module from Razorpay library

const { userAuth } = require("../middlewares/auth.js"); //Authentication Middleware
const paymentModel = require("../models/payment.js"); //payment DB model
const { membershipAmount } = require("../utils/constants.js"); // constants
const razorpayInstance = require("../utils/razorpay.js"); //Razorpay integration Module
const userModel = require("../models/user.js"); // DB model

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

// Web Hooks API - Razorpay call this API.
/* userAuth middleware shouldn't be used here in Webhook API. because, Razorpay doesn't loggedin to our system. */
/* *Razorpay cannot call a 'localhost server urls' using 'Webhooks'.
    Webhooks require a publicly accessible HTTPS URL. 
    so, use "NGROK" library. it creates a Public URL and receives user traffic and forwards requests to our localhost server.  
 */
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get("x-razorpay-signature"); // Razorpay sends the header and body. we have to verify webhook signature header.
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    ); // method to verify the Webhook

    if (!isWebhookValid) {
      return res.status(400).json({ msg: "Webhook signature is invalid" });
    }

    // 1. Update my Payment Status in Database
    const paymentDetails = req.body.payload.payment.entity; // req.body will have payment event data
    const payment = await paymentModel.findOne({
      orderId: paymentDetails.order_id,
    }); // DB Query
    payment.status = paymentDetails.status;
    await payment.save();

    // 2. Update the User as Premium
    const user = await userModel.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;

    // Activated Events in Web Hooks
    /*
    if (req.body.event === "payment.captured") {
    }
    if (req.body.event === "payment.failed") {
    }
    */

    //  3. return 'success' response to razorpay
    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = paymentRouter;
