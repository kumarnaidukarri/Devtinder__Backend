const express = require("express");
const app = express(); // Express Server

const http = require("http");
const server = http.createServer(app); // creating a Http Server from existing Express Server(app). it can handle Express routes, websockets/socket.io

// require("dotenv").config();
/* install "dotenv" library and config setup needed for accessing '.env' variables. if Nodejs version is below 20. 
  Nodejs V20+ has built-in dotenv and auto config.
*/
const cron = require("./utils/cronjob.js"); // Cron Job file

const { connectDB } = require("./config/database.js");
const cookieParser = require("cookie-parser"); //'cookie-parser' Library
const cors = require("cors"); //'cors' Library

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL_FOR_CORS,
];
app.use(
  cors({
    origin: function (clientOrigin, callback) {
      // Allow requests with "NO ORIGIN"(undefined).  ex:Postman, server-to-server
      if (allowedOrigins.includes(clientOrigin) || clientOrigin === undefined) {
        callback(null, true); // cors allow the origin
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
const paymentRouter = require("./routes/payment.js");
const chatRouter = require("./routes/chat.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

// Test route
app.get("/test", (req, res) => {
  res.send("Backend is running fine ...");
});
// Health check route - Github actions workflow, UptimeRobot, CronJob.
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// SOCKETS IO
const initializeSocketServer = require("./utils/socket.js"); // socket module file
initializeSocketServer(server);

connectDB()
  .then(() => {
    console.log("Database connection Success ...");
    //only after DB connection, listening for API client requests
    server.listen(Number(process.env.PORT_NUMBER) || 3000, function () {
      // Accessing Port_Number from '.ENV' file
      console.log(
        `Server listening on port ${process.env.PORT_NUMBER || 3000} ...`,
      );
    });
  })
  .catch((err) => {
    console.error("Database connection Failed...");
    console.log(err);
  });

// The END Completed
