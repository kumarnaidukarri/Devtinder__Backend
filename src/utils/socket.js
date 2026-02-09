// Socket.js file contains socket setup
const socket = require("socket.io"); // "Socket.Io" Library

const initializeSocket = (httpServer) => {
  const io = socket(httpServer, { cors: { origin: "http://localhost:5173" } }); // creating a 'Socket IO Server' and attaching to existing nodejs httpServer.
  /*  start listening for connections.
  'on' fires every time a client connects. socket means 'one specific user'  */
  io.on("connection", (socket) => {
    console.log("user connected: ", socket.id);

    /* Event Handlers - we write some events using "socket.on(eventName, HandlerFunction)" in this backend server.
       these events can be called from Frontend using "socket.io client" library */
    // socket.on("event name", handler function)
    socket.on("joinChat", () => {});
    socket.on("sendMessage", () => {});
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;

//
/*
 Realtime Chatting Application using Web Sockets.

 "Socket.IO Library" :-
 it is a JavaScript library built on top of 'Web Socket' and fallback techniques.
 it enables 'low-latency', 'bi-directional', 'event-based' communication between client and server.
 it automatically handles - Connection management, Auto Reconnection, Fallback to HTTP long-polling if WebSocket is not supported.
 it allows client and server talk to each other in real time.

 Working:
  -> You run a "Socket.IO server" (commonly with Node.js).
  -> The browser (or mobile app) connects via a persistent connection.
  -> Both sides can emit events and listen for events.

 it gives 2 APIs Docs:
  i)  Client API(Frontend):
       docs url: https://socket.io/docs/v4/client-api/
       * Library command: npm install socket.io-client 
       setup steps: 
        Configure your Client:
          
  ii) Server API(Backend) :
       docs url: https://socket.io/docs/v4/server-api/
       * Library command: npm install socket.io
       setup steps: 
        Configure your Server: 
           let http = require('http');
           let server = http.createServer(app); // creating a Http Server from existing Express Server(app).     

           const socket = require("socket.io"); // "Socket.Io" Library
           const io = socket(server,{cors:{origin}}); // Socket.IO requires an HTTP server because it upgrades the HTTP connection into a WebSocket connection.
           io.on("connection", (socket) => {
                console.log("user connected: ", socket.id);

                // Event Handlers - we write some events using "socket.on(eventName, HandlerFunction)" in this backend server.
                // these events can be called from Frontend using "socket.io client" library 
                // socket.on("event name", handler function)
                socket.on("joinChat", () => {});
                socket.on("sendMessage", () => {});
                socket.on("disconnect", () => {});
            });

*/
