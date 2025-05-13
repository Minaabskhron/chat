import jwt from "jsonwebtoken";
import userModel from "../modules/user/user.model.js";

export const authenticateSocket = async (socket, next) => {
  // Middleware function
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!token) return next(new Error("Authentication required")); // Reject if no token

    // Verify JWT (remove 'Bearer ' prefix if present)

    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_KEY
    );
    // Find user in database
    const user = await userModel.findById(decoded._id);
    if (!user) return next(new Error("User not found"));

    socket.user = user; // Attach user object to socket
    next();
  } catch {
    next(new Error("Authentication failed"));
  }
};
