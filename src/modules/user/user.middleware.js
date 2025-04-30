import { AppError, catchError } from "../../utils/handleErrors.js";
import jwt from "jsonwebtoken";
import userModel from "./user.model.js";

export const auth = catchError(async (req, res, next) => {
  let token;

  if (req.headers.token && req.headers.token.startsWith("Bearer "))
    token = req.headers.token.split(" ")[1];

  if (!token) throw new AppError("Unauthorized", 401);

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await userModel.findById(decodedToken._id);

  if (!user) throw new AppError("user not found", 401);

  if (user.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      user.passwordChangedAt.getTime() / 1000
    );

    if (changedTimestamp > decodedToken.iat)
      throw new AppError("Password changed - please reauthenticate", 401);
  }

  req.user = {
    _id: user._id,
    role: user.role,
    email: user.email,
  };

  next();
});

export const authorize = (role) => {
  return catchError(async (req, res, next) => {
    if (role !== req.user.role) throw new AppError("forbidden", 403);
    next();
  });
};
