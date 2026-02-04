// Razorpay Integration file
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/*
instance.orders.create({
  amount: 50000,
  currency: "<currency>",
  receipt: "receipt#1",
  notes: {
    key1: "value3",
    key2: "value2",
  },
}); 
*/

module.exports = instance;

// Payment Gateway Integration Razorpay :-
/*
Razorpay Docs:
Web Integration 
1)Build integration:- 
 i)Create Order:- 
     install library: npm install razorpay
     const Razorpay = require("razorpay");
     let instance = new Razorpay({ key_id:'YOUR_KEY_ID', key_secret:'YOUR_SECRET' });
     instance.orders.create({
        amount:50000,currency:"INR",receipt:"receipt#1", notes:{key1:"value3",key2:"value2"}
     });
     output:-
      Success Response:
       {"id":"order_IluGWxBm9U8zJ8","entity":"order","amount":50000,"amount_paid":0,"amount_due":50000,"currency":"INR","receipt":"rcptid_11","offer_id":null,"status":"created","attempts":0,"notes":[],"created_at":1642662092}
      Failure Response:
       { "error": {"code": "BAD_REQUEST_ERROR", "description": "Order amount less than minimum amount allowed",
                   "source": "business","step": "payment_initiation","reason":"input_validation_failed","metadata": {},"field": "amount"}
       }
      note:-               
      Generate 'Key Id' and 'Secret Key'. Razorpay dashboard -> Account & Settings -> generate test key.
      Add those key in your app razorpay integration file directly or '.ENV' file safely.     
*/
