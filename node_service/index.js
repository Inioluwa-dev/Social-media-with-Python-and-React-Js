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

// Test endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node.js!' });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);  // Broadcast the message to all clients
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3001, () => {
  console.log('Node.js server listening on port 3001');
});
