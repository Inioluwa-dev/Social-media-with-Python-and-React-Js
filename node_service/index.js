const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');

// Example MongoDB URI (replace with your actual one if needed)
const uri = "mongodb://localhost:27017/social_media_db"; // 

const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB();


// Socket.IO example
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data) => {
    console.log("Message received:", data);
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Node.js server running on http://localhost:3001");
});




// import { io } from "socket.io-client";
// const socket = io("http://localhost:3001");

// socket.emit("send_message", { text: "Hello from React!" });
