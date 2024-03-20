import { Request, Response, NextFunction } from "express";
import errorHandler from "../lib/errorHandler";
import { verifyUserToken } from "../lib/auth";
import CustomError from "../lib/customError";

// When making this call in the Frontend DEVS must pass in user JWT as bearer token
export async function userAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new CustomError("Authentication Error", "Authorization header not found", 401);

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) throw new CustomError("Authentication Error", "Bearer token not found", 401);

  try {
    const decoded = verifyUserToken(token);
    res.locals.user = decoded;
    next();
  } catch (err: any) {
    errorHandler(err, req, res);
  }
}
