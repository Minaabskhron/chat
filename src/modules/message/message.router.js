import { Router } from "express";
import { getConversation, sendMessage } from "./message.controller.js";
import { auth } from "../user/user.middleware.js";

const messageRouter = Router();
messageRouter.post("/sendMessage", auth, sendMessage);
messageRouter.get("/getConversation/:receiverId", auth, getConversation);

export default messageRouter;
