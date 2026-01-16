const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // "ref" to the 'User' collection/model
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // "ref" to the 'User' collection/model
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);

/* Compound Indexing - for quering with multiple fields. 1 means Ascending, -1 means Descending
    Syntax: Schema.index{ field1Name:1, field2Name:1 }; 
    Ex: userSchema.index({firstName:1, lastName:1}); 
        users.find({firstName:'Ram', lastName:'Kumar'}); -> faster search  
*/
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// "Pre" Middleware - executes before the save() method
connectionRequestSchema.pre("save", function (next) {
  // Check if the fromUserId is same as toUserId
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself!");
  }
  next(); // calls save()
});

const connectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = connectionRequestModel;
