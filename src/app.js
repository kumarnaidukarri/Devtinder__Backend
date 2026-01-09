const express = require("express");
const app = express();

const { connectDB } = require("./config/database.js");
const cookieParser = require("cookie-parser"); //'cookie-parser' Library
const cors = require("cors"); //'cors' Library

app.use(cors()); // middleware fix cors, allows client requests from all origins domains
app.use(express.json()); // middleware converts JSON data into Javascript object
app.use(cookieParser()); // middleware parses Cookies from Request object

// Importing Routers
const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("Database connection Success ...");
    //only after DB connection, listening for API client requests
    app.listen(3000, function () {
      console.log("Server listening on port 3000 ...");
    });
  })
  .catch((err) => {
    console.error("Database connection Failed...");
  });
