const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(process.env.Mongodb_Url); // Accessing Mongodb connection url string from '.ENV' file
};

module.exports = { connectDB };

/*
//  we should connect database first and then, only we start "listening" for API client requests.
//  because, before connection we can't serve clients who need DB related operations.
connectDB
  .then(() => {
    console.log("Database connection Success...");
  })
  .catch((err) => {
    console.error("Database connection Failed...");
  });
*/
