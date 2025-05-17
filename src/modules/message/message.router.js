import { Router } from "express";
import { getAllConversation, sendMessage } from "./message.controller.js";
import { auth } from "../user/user.middleware.js";

const messageRouter = Router();
messageRouter.post("/sendMessage", auth, sendMessage);
messageRouter.get("/getConversation/:receiverId", auth, getAllConversation);

export default messageRouter;
