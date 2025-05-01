// index.js (Node.js server)
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');  // Import CORS middleware

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow only this origin to connect
    methods: ['GET', 'POST'], // Allow these HTTP methods
    allowedHeaders: ['my-custom-header'], // Optional: If you use custom headers
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
  }
});


server.listen(3001, () => {
  console.log('Node.js server listening on port 3001');
});
