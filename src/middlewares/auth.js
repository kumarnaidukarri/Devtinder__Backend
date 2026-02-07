// Authentication Middleware
const jwt = require("jsonwebtoken"); //'jsonwebtoken' Library
const userModel = require("../models/user.js");

const userAuth = async (req, res, next) => {
  try {
    // Read the Token from req cookies
    const { token } = req.cookies; // {c1:v1,c2:v2,...}
    if (!token) {
      // throw new Error("Token is not valid!!!");
      return res.status(401).send("Please Login!");
    }

    // Validate the Token
    const decodedObj = await jwt.verify(token, "DevTinder");
    const { _id } = decodedObj;

    // Find the user
    const user = await userModel.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    console.log("AUTH Middleware Called");
    next();
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

module.exports = { userAuth };
