import userModel from "./user.model.js";

export async function setUserOnline(userId) {
  // You can adapt this to whatever ORM/ODM you’re using.
  await userModel.findByIdAndUpdate(userId, {
    isOnline: true,
  });
}

/**
 * Mark a user as offline and record lastSeen timestamp
 */
export async function setUserOffline(userId) {
  await userModel.findByIdAndUpdate(userId, {
    isOnline: false,
    lastSeen: new Date(),
  });
}
