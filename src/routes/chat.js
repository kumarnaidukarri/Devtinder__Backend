const express = require("express");
const chatRouter = express.Router();

// my modules
const chatModel = require("../models/chat"); // Chat model in DB
const { userAuth } = require("../middlewares/auth");

// Get Chat API -
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await chatModel
      .findOne({
        participants: { $all: [userId, targetUserId] },
      })
      .populate({ path: "messages.senderId", select: "firstName lastName" });
    if (!chat) {
      chat = new chatModel({
        participants: [userId, targetUserId],
        messages: [],
      }); // new chat obj
      await chat.save(); // save into DB
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
  }
});

module.exports = chatRouter;
