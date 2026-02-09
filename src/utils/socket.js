// Socket.js file contains socket setup
const socket = require("socket.io"); // "Socket.Io" Library

const initializeSocket = (httpServer) => {
  const io = socket(httpServer, { cors: { origin: "http://localhost:5173" } }); // creating a 'Socket IO Server' and attaching to existing nodejs httpServer.

  /* Fired every time a new client connects to the Socket.IO server
     'Socket' represents ONE connected client (one user). */
  io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    /* Event Handlers - we write some events using "socket.on(eventName, HandlerFunction)" in this Socket Server.
       these events can be called from Frontend using "socket.io client" library */
    // socket.on("event name", handler function)
    socket.on("joinChat", ({ userId, targetUserId }) => {
      /*
       * JoinChat event -
       * Triggered from the frontend when a user opens a chat with another user.
       * Payload contains:
       *  - userId: current logged-in user
       *  - targetUserId: user they want to chat with
       */
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

      const roomId = [userId, targetUserId].sort().join("_"); // "140011_225441"
      /* A Socket is a 'connected user'. A Room is a logical group of sockets. i.e, temporary in memory.
         Users in the same room can receive the same messages. 
         A Room is destroyed, when all sockets leave room or all sockets disconnect.    
         *
         Socket.IO finds a room in its internal memory.
         i) if specified room found, current socket(user) added to existing room.
         ii)if room doesn't exist,   a New Room is created and socket(user) is added to it. 
 
      */
      socket.join(roomId); // creates a room or joins the room.
      console.log("Joining Room : ", roomId);
    });
    socket.on("sendMessage", () => {});
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;

// Realtime Chatting Application using Web Sockets.
/*
Web Sockets :-
 WebSocket is a communication protocol that enables real-time, bi-directional communication between client and server over a persistent connection.
 Bi-Directional communication means 2 way communication. Both client and server can send data at any time.
 server can connect with multiple clients and communicate each other. Connection remains open until closed explicitly.
 Web socket connections can be established using: HTTP Long-Polling, WebSocket Protocol, WebTransport.
 Web Socket requires: Code on both client and server.

"Socket.IO" Library :-
 it is a JavaScript library built on top of 'Web Socket', Engine.IO, fallback techniques.
 it enables 'low-latency', 'bi-directional', 'event-based' communication between client and server.
 it allows client and server talk to each other in real time.

 working:
  1) a "Socket.IO server" runs (commonly with Node.js).
  2) The browser (or mobile app) connects using a persistent connection.
  3) Both client and server can emit events and listen for events.

 Socket.IO give 2 APIs :-
  i)  Client API(Frontend):
       docs url: https://socket.io/docs/v4/client-api/
       * Library command: npm install socket.io-client
       usage:
        configure your client:
        import { io } from "socket.io-client";
        const socket = io("http://localhost:3000"); // connect to backend server
        socket.emit(eventName, data); // send event to server
        // *** IMP - disconnect when done.
        socket.disconnect();

  ii) Server API(Backend) :
       docs url: https://socket.io/docs/v4/server-api/
       * library command: npm install socket.io
       configure your server:
         let http = require('http');
         let server = http.createServer(app); // creates an Http Server from existing Express Server(app).

         const socket = require("socket.io"); // "Socket.Io" Library
         const io = socket(server,{cors:{origin}}); // Socket.IO requires an HTTP server. because, it starts with HTTP handshake and then, upgrades the connection to a WebSocket connection.

         /*
           Fired whenever a new client connects to the Socket.IO server.
           'socket' represents ONE connected client (one user).
         */

/*
         io.on("connection", (socket) => {
                console.log("user connected: ", socket.id);

                // Event Handlers - we write some events using "socket.on(eventName, HandlerFunction)" in this backend server.
                // these events can be called from Frontend using "Socket.IO Client" library
                // socket.on("event name", handler function)
                socket.on("joinChat", () => {});
                socket.on("sendMessage", () => {});
                socket.on("disconnect", () => {});
            });
*/
