export class AppError extends Error {
  statusCode;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const catchError = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next); //A wrapper for async route handlers: any exception or rejected promise forwards
  // to next() so the errorhandler catches it.
};

export const errorhandler = (err, req, res, next) => {
  //Final middleware in the chain. Reads err.statusCode (default 500),
  // and in development sends back both message and stack; in production only the message.
  err.statusCode = err.statusCode || 500;
  if (process.env.MODE === "production") {
    return res.status(err.statusCode).json({ error: err.message });
  }
  res.status(err.statusCode).json({ error: err.message, stack: err.stack });
};

export const InvalidRoutes = (req, res, next) => {
  //Catches any unmatched route,
  // creates a plain Error with a 404 code,
  // and calls next(err) so errorhandler will format and send the response.
  throw new AppError(`not found endPoint ${req.originalUrl}`, 404);
};
