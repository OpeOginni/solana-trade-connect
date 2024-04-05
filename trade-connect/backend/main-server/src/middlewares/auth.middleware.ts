import { Request, Response, NextFunction } from "express";
import db from "../db";
import { companyAccessAuthMiddlewareSchema } from "../types/middleware.types";
import CustomError from "../lib/customError";
import errorHandler from "../lib/errorHandler";
import { verifyCompanyToken } from "../lib/auth";

export async function accessKeyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const accessKey = req.headers["trade-connect-access-key"];
    const companyId = req.headers["trade-connect-company-id"];

    const dto = companyAccessAuthMiddlewareSchema.parse({
      accessKey,
      companyId,
    });

    const storedAccessKey = await db.accessKey.findFirst({
      where: {
        accessKey: dto.accessKey,
      },
    });

    if (!storedAccessKey) throw new CustomError("Authentication Error", "Invalid Access Key or Company ID", 401);

    if (storedAccessKey.companyId !== companyId) throw new CustomError("Authentication Error", "Invalid Access Key or Company ID", 401);

    next();
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}

export async function companyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new CustomError("Authentication Error", "Authorization header not found", 401);

  const token = authHeader.split(" ")[1]; // Bearer <token>
  if (!token) throw new CustomError("Authentication Error", "Bearer token not found", 401);
  try {
    const decodedToken = verifyCompanyToken(token);
    if (!decodedToken || !decodedToken.companyId) throw new CustomError("Authentication Error", "Invalid Token", 401);

    res.locals.company = decodedToken;
    next();
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}
