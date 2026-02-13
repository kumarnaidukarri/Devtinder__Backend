// user chat schema
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  messages: [messageSchema], // keeping a schema
});

// to use a Schema, we need a 'Model'
const chatModel = mongoose.model("Chat", chatSchema);

module.exports = chatModel;

/*
Chat Collection =  [ chat1 obj, chat2, chat3, chat4, ... ]
Chat Schema Obj = { _id:1, participants : [fromUserId, toUserId], messages:[ msg1 obj, msg2 obj, ... ] }
Message Schema Obj  =  { _id:5, senderId:'', text:'message text' }

Example:-
Chat Collection  =  [ {}, {}, {}, ... ]
Chat Schema Obj  =  { _id:'1ebcv1',  participants:['51e2cvdfg','89euio55v'], messages:[{},{},{},...] }
Message Schema Obj  =  {_id:'6evuiop', senderId:'5cbviop', text:'text message of user'}   
*/
