const express = require("express");
const requestRouter = express.Router(); // request Router

const { userAuth } = require("../middlewares/auth.js"); //Authentication Middleware
const connectionRequestModel = require("../models/connectionRequest.js");
const userModel = require("../models/user.js");

// Send Connection Request API -
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    console.log("Send Connection Request Send API Called");
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status }); //res.send()
      }

      // Finding toUser in DB
      const toUser = await userModel.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "User not found" });
      }

      // Check IF there is an already Existing connection request
      const existingConnectionRequest = await connectionRequestModel.findOne({
        $or: [
          { fromUserId: fromUserId, toUserId: toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      }); // check A send to B (or) B send to A
      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection Request Already Exists!!!" });
      }

      const connectionRequest = new connectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      }); //res sending
    } catch (err) {
      res.status(400).send("Error: " + err.message);
    }
  },
);

// Review Connection Request API -
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    console.log("Review Connection Request API Called");
    try {
      // loggedId == toUserId,  status = interested
      // request id should be valid present in DB
      /* A(fromId) sent request to B(toId). B has to logged in to accept request */

      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed!" });
      }

      const connectionRequest = await connectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection request not found" });
      }

      //
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).send("Error: " + err.message);
    }
  },
);

module.exports = requestRouter;
