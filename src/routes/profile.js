const express = require("express");
const profileRouter = express.Router(); // profile Router

const { userAuth } = require("../middlewares/auth.js"); //Authentication Middleware
const { validateEditProfileData } = require("../utils/validation.js");
const bcrypt = require("bcrypt"); //'bcrypt' Library
const validator = require("validator"); //'validator' Library

// Profile View API - get user profile data
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  console.log("Profile View API Called");
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// Profile Edit API - edit user profile data in DB
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  console.log("Profile Edit API Called");
  try {
    // Validate Edit data
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }
    const loggedInUser = req.user; // DB user
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();

    //res.send(`${loggedInUser.firstName} your profile updated successfully`);
    res.json({
      message: `${loggedInUser.firstName} your profile updated successfully`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// Profile Password Update API - update user password in DB
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  console.log("Profile Password Update API Called");
  try {
    const newPassword = req.body.password;
    const loggedInUser = req.user;
    if (
      newPassword === "" ||
      newPassword === undefined ||
      !validator.isStrongPassword(newPassword)
    ) {
      throw new Error(
        "Enter a strong Password! It should be atleast 8 characters length, 1 uppercase, 1 lowercase, 1 number, 1 special symbol.",
      );
    }

    // generate the new Hashed Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    loggedInUser.password = hashedPassword;
    await loggedInUser.save();

    res.send("Password updated Successfully");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

module.exports = profileRouter;
