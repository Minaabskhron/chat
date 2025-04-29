import mongoose from "mongoose";
//sudo systemctl start mongod

const dbConnection = () => {
  mongoose
    .connect(process.env.MOONGOOSECONNECTION)
    .then(() => {
      console.log("database connection established");
    })
    .catch((err) => {
      console.error("DBerr", err);
    });
};

export default dbConnection;
