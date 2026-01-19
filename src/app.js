const express = require("express");
const app = express();

const { connectDB } = require("./config/database.js");
const cookieParser = require("cookie-parser"); //'cookie-parser' Library
const cors = require("cors"); //'cors' Library

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
); // middleware fix cors
/* 'cors config object' used to allow requests from specified 'ORIGINS DOMAINS', enables Cookies/Credentials to be sent btw frontend and backend */
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
    app.listen(Number(process.env.Port_Number) || 3000, function () {
      // Accessing Port_Number from '.ENV' file
      console.log(
        `Server listening on port ${process.env.Port_Number || 3000} ...`,
      );
    });
  })
  .catch((err) => {
    console.error("Database connection Failed...");
    console.log(err);
  });
