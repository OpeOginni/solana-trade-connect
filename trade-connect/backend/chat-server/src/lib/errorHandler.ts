import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import CustomError from "./customError";

// This is a custom error handler function to handle all errors in the app
export default function errorHandler(err: Error, req: Request, res: Response, next?: NextFunction) {
  if (err instanceof ZodError) {
    // Handles all Zod Validation Error
    const errors = err.errors.map((error) => ({
      param: error.path[0],
      message: error.message,
    }));
    return res.status(400).json({ error: "Validation Error", errors });
  }

  if (err instanceof CustomError) {
    // Handles all our Custom Errors

    return res.status(err.code).json({ error: err.title, message: err.message });
  }
  res.status(500).json({ message: "Internal server error", detail: err.message });
}
