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
import http from "http";
import { Server as IOServer } from "socket.io";
import dbConnection from "./database/dbConnection.js";
import { bootstrap } from "./bootstrap.js";
import { registerSocketHandlers } from "./src/socket/index.js";

dotenv.config();
//import { v2 as cloudinary } from "cloudinary";

//cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
//  });

const app = express();

const port = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

const io = new IOServer(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://chatfront-git-main-minaabskhrons-projects.vercel.app",
      "https://chat-production-96ee.up.railway.app",
    ],
    credentials: true,
  },
});

registerSocketHandlers(io);

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
