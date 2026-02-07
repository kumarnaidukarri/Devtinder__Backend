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
  console.log("Payment Create Order API Called");
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
        emailId: emailId,
        membershipType: membershipType,
      },
    });

    // 2. Save it in my Database
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

    // 3. Return back my 'Order details' to Frontend.
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
  console.log("Payment Webhook API Called");
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

    //* 2. Update the User as Premium in Database(user collection)
    const user = await userModel.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    // Activated Events in Web Hooks
    /*
    if (req.body.event === "payment.captured") {
    }
    if (req.body.event === "payment.failed") {
    }
    */

    // 3. return 'success' response to razorpay
    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
});

// API verifies User is Premium or Not. i.e, Membership(silver/gold) purchased or not.
paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  console.log("Premium Verify API Called");
  try {
    const user = req.user.toJSON(); // converts Mongoose Document to plain JavaScript object
    if (user.isPremium === true) {
      return res.json({ isPremium: true });
    }
    return res.json({ isPremium: user.isPremium });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = paymentRouter;

// *** Note :-
/* Webhooks don't work in localhost server machine.
   use "Ngrok" library. it creates a temporary Public URL and forwards requests to your 'Localhost'. 
   Forwarding  https://abcd-12-34-56.ngrok-free.app  ->  http://localhost:3000
   Add 'Ngrok Url + Backend Webhook Url' in your Payment Gateway Webhooks. Add Webhook url "https://abcd-12-34-56.ngrok-free.app/paymentWebhook" instead of 'http://localhost:3000/paymentWebhook'.
   ex: npm install ngrok
       node server.js
       npx ngrok http 3000 --authtoken '39LxDhBvtCtVNHRqb3k3Vv5cir6_4f4TycXi2BnGuYQo65mJ9'

       =>   login into 'Ngrok website dashboard', get auth key, add it in your project when running ngrok command. 
       => * Both Node server and Ngrok server must be runned in '2 Different Terminals'.
*/
