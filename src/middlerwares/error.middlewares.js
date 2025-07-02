import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;
  if ((!error) instanceof ApiError) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);

    const response = {
      ...error, // destructring the error
      message: error.message, // what the actual error is
      ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}), // destructring when enviorment is development , then we are going to
      // have stack otherwise keep it empty
    };
    return res.status(error.statusCode).json(response);
  }
};

export { errorHandler };
