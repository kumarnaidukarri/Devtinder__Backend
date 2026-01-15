const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth.js");
const connectionRequestModel = require("../models/connectionRequest.js");
const userModel = require("../models/user.js");

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "photoUrl",
  "about",
  "skills",
];

// GET API - get all the Pending connection requests for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await connectionRequestModel
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", USER_SAFE_DATA); // Query with 'populate()'

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// GET API - get all my connections
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // others accepted my Requests, i accepted other Requests.
    const connectionRequests = await connectionRequestModel
      .find({
        $or: [
          { toUserId: loggedInUser._id, status: "accepted" },
          { fromUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });
    res.json({ data: data });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// Feed API with Pagination - /feed?page=2&limit=10
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    /* User should see all user profile cards except:
     0. his own card
     1. his connections
     2. ignored people
     3. already sent the connection request
    */
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit; // data sanitize
    const skip = (page - 1) * limit;

    // Find all connection requests (sent + recieved)
    const connectionRequests = await connectionRequestModel
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select(["fromUserId", "toUserId"]);

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await userModel
      .find({
        $and: [
          { _id: { $nin: Array.from(hideUsersFromFeed) } },
          { _id: { $ne: loggedInUser._id } },
        ],
      })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);
    // 'select([field1,field2,...])' means it selects only 'mentioned Fields' from Documents.
    // skip(n) - skips first n documents, limit(n) - gives you 'n' documents.
    res.json({ data: users });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

/*
  Pagination in mongoDb: 
   limit(n) -  how many documents you want 
   skip(n)  -  how many you want to skip from First starting.

  Scenario: In feed api
   /feed?page=1&limit=10 => 1-10  => .skip(0)  & .limit(10)
   /feed?page=2&limit=10 => 11-20 => .skip(10) & .limit(10)
   /feed?page=3&limit=10 => 21-30 => .skip(20) & .limit(10)

  formula: skip = (page-1)*limit
 */

module.exports = userRouter;
