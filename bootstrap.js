import { json } from "express";
import { errorhandler, InvalidRoutes } from "./src/utils/handleErrors.js";
import v1Router from "./src/routers/v1.routes.js";
import cors from "cors";

//import cors from "cors"; //npm i cors @types/cors

export const bootstrap = (app) => {
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );
  app.use(
    cors({
      origin: ["https://your-vercel-app.vercel.app"],
      credentials: true,
    })
  );
  //app.use(cors()); //3ashan trf3 alcode 3ala server
  app.use(json()); //parses incoming JSON bodies..
  app.use("/api/v1", v1Router); //gwa alsrc routers v1.routes.js mgrouter
  // app.use(express.static("uploads")); //for local
  app.use(/.*/, InvalidRoutes); //gwa alsrc hn7ot utils handleError mhandleError
  //any path not matched above
  // goes to InvalidRoutes, which throws a 404 Error.
  app.use(errorhandler); //catches all thrown Errors (including those from InvalidRoutes),
  // formats the response, and sends JSON back.
};
