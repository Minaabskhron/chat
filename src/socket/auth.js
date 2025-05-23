import jwt from "jsonwebtoken";
import userModel from "../modules/user/user.model.js";

export const authenticateSocket = async (socket, next) => {
  try {
    // 1. Get token from proper location
    const token = (
      socket.handshake.auth?.token ||
      socket.handshake.headers?.token ||
      ""
    ).replace(/^Bearer\s+/i, "");

    // 2. Validate token presence
    if (!token) {
      console.error("No token provided:", socket.id);
      return next(new Error("Authentication required"));
    }

    // 3. Verify token with error details
    const decoded = jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        console.error("JWT Error:", err.name);
        throw new Error(`Token error: ${err.message}`);
      }
      return decoded;
    });

    // 4. Find user with proper error handling
    const user = await userModel
      .findById(decoded._id)
      .select("_id username isOnline lastSeen conversations")
      .orFail(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    console.error(`Auth failed [${socket.id}]:`, err.message);
    next(new Error("Authentication failed"));
  }
};
