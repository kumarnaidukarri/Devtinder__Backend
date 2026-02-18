// Socket.js file contains 'Socket' Server setup.
const { Server } = require("socket.io"); // Socket.Io Library
const crypto = require("crypto"); // Crypto Library
const chatModel = require("../models/chat.js"); // chat DB model
const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");

  /*
      * Generate a unique room ID.
          code: [user1Id,user2Id].sort().join();
          steps:
          1.Put both user IDs into an array
          2.Sort them to ensure same order for both users
          3.Join them with "_" to form a unique room name
          Example:
          i)
            userId = 550, targetUserId = 225
            [550,225] -> sort -> [225,550]
            roomId = "225_550"
      * This guarantees both users join the SAME Room.

      * Scenarios,
         user1Id = 550, user2Id = 225
         when user1 is joining, RoomId = [550,225] -> sorted [225,550] -> "225_550" 
         when user2 is joining, RoomId = [225,550] -> sorted [225,550] -> "225_550"
         With this logic, both users can generate same room id and join       
  */
  // make a Secured Hash code from output "id".  ex: "225_550" to "hefeRV5454pszcvv".
}; // func to generate unique RoomId in 'secured hash' format.

const initializeSocketServer = (httpServer) => {
  const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL_FOR_CORS,
  ];

  const socketServer = new Server(httpServer, {
    cors: {
      origin: function (clientOrigin, callback) {
        // Allow requests with "NO ORIGIN"(undefined).  ex:Postman, server-to-server
        if (
          allowedOrigins.includes(clientOrigin) ||
          clientOrigin === undefined
        ) {
          callback(null, true); // cors allow the origin
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    },
  }); // Create a 'Socket IO Server' and attach to Http server.

  /* Fires whenever a new client connects. 'Socket' represents 'ONE Connected User' */
  socketServer.on("connection", (socket) => {
    console.log("User connected to Socket Server.", "socket id:", socket.id);

    /* Defining socket server events :-
       syntax: socket.on("event name", handler function) */

    // Join Chat Event
    socket.on("joinChat", ({ userId, targetUserId }) => {
      /*
       * Triggers, when user opens a chat with another user in Frontend.
       * Payload: {userId, targetUserId}
       */

      // const roomId = [userId, targetUserId].sort().join("_"); // "140011_225441"
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log("Secure Hashed RoomId:", roomId);

      /*
        Socket =>  Represents one connected client (one user).
        Room   =>  A logical group of sockets inside Socket.IO (stored in memory).

        • All sockets in the same room can receive the same events/messages.
        • Rooms exist only in memory.
        • A room is automatically removed when all sockets leave or disconnect.
        
        How joining works:
         - If the room already exists → the socket is added to it.
         - If the room does not exist → Socket.IO creates it and adds the socket.
      */
      socket.join(roomId); // creates a room or joins the room.
      console.log(userId + " Joined into Room");
    });

    // Send Message Event
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        /*
         * Triggered when user sends a message.
         * Payload : { firstName, userId, targetUserId, text }
         */
        console.log(
          "'sendMessage' event emitted Called.",
          "Message received from:",
          firstName,
        );
        // const roomId = [userId, targetUserId].sort().join("_");
        const roomId = getSecretRoomId(userId, targetUserId);

        // *** Save Messages(chat) in the Database.
        try {
          let chat = await chatModel.findOne({
            participants: { $all: [userId, targetUserId] },
          }); // find the chat(obj) in Chat Collection(arr), where it contains both 'userId and targetUserId' in Participants.
          if (!chat) {
            // if chat not exists.  Create new chat data into DB.
            chat = new chatModel({
              participants: [userId, targetUserId],
              messages: [],
            });
          }
          chat.messages.push({ senderId: userId, text });
          await chat.save();

          /*
           *  message will be sent to 'roomId' using 'io.to(room_id)'.
           *  server  will emit/call Event to Frontend using 'emit()'.
           * Emit message to 'ALL users' in the room.  (both sender and receiver).
           * Frontend must listen to :  socket.on("messageReceived", handler).
           */

          socketServer
            .to(roomId)
            .emit("messageReceived", { firstName, lastName, text }); // Emit an event 'msgReceived' to Frontend Client. i.e,all users in room get this event emitted in their frontend.
        } catch (err) {
          console.log(err);
        }
      },
    );

    // Disconnect Event
    socket.on("disconnect", () => {
      console.log(
        "!!! User disconnected from Socket Server.",
        "socket id:",
        socket.id,
      );
    });
  });
};

module.exports = initializeSocketServer;

// Realtime Chatting Application using Web Sockets.
/*
Web Sockets :-
 WebSocket is a communication protocol that enables real-time, bi-directional communication between client and server over a persistent connection.
 Bi-directional means: Client can send data to server anytime. Server can send data to client anytime.
 key points:
   • Connection stays open until explicitly closed
   • One server can handle multiple clients
   • Used for real-time apps (chat, notifications, gaming, etc.)
 note:
   Web Socket requires: code on both Client and Server.
   *** WebSocket starts with an HTTP handshake, then upgrades to a "WebSocket connection".
   

"Socket.IO" Library :-
 it is a JavaScript library built on top of 'Web Socket', Engine.IO, fallback techniques.
 it enables 'low-latency', 'bi-directional', 'event-based communication' between client and server.
 it allows client and server talk to each other in real time.

 Working:
  1) a "Socket.IO server" runs (commonly with Node.js).
  2) The browser (or mobile app) connects using a persistent connection.
  3) Both client and server can emit events and listen for events. 
     i.e, communication is 'event-driven'.

 Socket.IO give 2 APIs :-
  i)  Client API(Frontend):
       docs url: https://socket.io/docs/v4/client-api/
       * Library command: npm install socket.io-client
       usage:
        configure your client:
        import { io } from "socket.io-client";
        const socket = io("http://localhost:3000"); // connect to backend server
        socket.emit(eventName, data); // 1. Send event to server
        socket.on("eventName", (data) => { console.log(data); }); // 2. Listen for event from server
        // *** IMP - disconnect when done.
        socket.disconnect();

  ii) Server API(Backend) :
       docs url: https://socket.io/docs/v4/server-api/
       * library command: npm install socket.io
       configure your server:
         let http = require('http');
         let httpServer = http.createServer(app); // creates an Http Server from existing Express Server(app).

         const { Server } = require("socket.io"); // "Socket.Io" Library
         const socketServer = new Server(httpServer,{cors:{origin}}); // Socket.IO requires an HTTP server. because, it starts with HTTP handshake and then, upgrades the connection to a WebSocket connection.

         socketServer.on("connection", (socket) => {
            console.log("User connected:", socket.id);     
                 
            // Defining socket server events :-
            // syntax: socket.on("event name", handler function) 
            socket.on("joinChat", () => {});
            socket.on("sendMessage", () => {});
            socket.on("disconnect",  () => {console.log("User disconnected:", socket.id)});
         }); 
     });
*/
