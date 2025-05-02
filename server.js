//npm i express mongoose dotenv
//npm init

//npm i jsonwebtoken multer cloudinary bcrypt lw m7tag
//'main': 'server.js'
//'type': 'module'

//1. a3ml folder asmo database gwah file asmo dbConnections.js
//2. a3ml folder alcollection gwah 3 folders controllers w models w routers
//3. gwa almodels asm alcollection.model.ts w mmodel
//4. folder asmo routers gwa alsrc sameh routers gwah v1.routes.ts gwah mgrouter

import express from "express";
import dotenv from "dotenv";
import dbConnection from "./database/dbConnection.js";
import { bootstrap } from "./bootstrap.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
//import { v2 as cloudinary } from "cloudinary";

//cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
//  });

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server
const httpServer = http.createServer(app);

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_KEY
    );
    const user = await userModel.findById(decoded._id);

    if (!user) return next(new Error("Authentication error"));
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user._id}`);

  // Join user to their conversation rooms
  socket.on("join-conversations", (conversationIds) => {
    conversationIds.forEach((convId) => {
      socket.join(convId.toString());
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user._id}`);
  });
});

// Attach Socket.IO to app
app.io = io;

dbConnection(); //gwa database bara 5als
bootstrap(app); //bara 5als

process.on("uncaughtException", (err) => {
  //Catches synchronous Logs the error
  //for syntax error
  console.log("uncaughtException", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  // d bta3lg ay 7aga mashakel alconnection
  //Catches rejected Promises
  console.log("unhandledRejection", err);
  process.exit(1);
});

httpServer.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
