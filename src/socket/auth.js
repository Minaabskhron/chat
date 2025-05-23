import jwt from "jsonwebtoken";
import userModel from "../modules/user/user.model.js";

export const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await userModel
      .findById(decoded._id)
      .select("_id username isOnline lastSeen conversations")
      .lean();

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (err) {
    console.error(`Socket auth error [${socket.id}]:`, err.message);
    next(new Error("Invalid or expired token"));
  }
};
