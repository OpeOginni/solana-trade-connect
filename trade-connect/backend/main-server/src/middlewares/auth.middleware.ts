import { Request, Response, NextFunction } from "express";
import db from "../db";
import { companyAccessAuthMiddlewareSchema } from "../types/middleware.types";
import CustomError from "../lib/customError";
import errorHandler from "../lib/errorHandler";

export async function accessKeyAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const accessKey = req.headers["trade-connect-access-key"];
    const companyId = req.headers["trade-connect-companyId"];

    const dto = companyAccessAuthMiddlewareSchema.parse({
      accessKey,
      companyId,
    });

    const storedAccessKey = await db.accessKey.findFirst({
      where: {
        accessKey: dto.accessKey,
      },
    });

    if (!storedAccessKey)
      throw new CustomError(
        "Authentication Error",
        "Invalid Access Key or Company ID",
        401
      );

    if (storedAccessKey.companyId !== companyId)
      throw new CustomError(
        "Authentication Error",
        "Invalid Access Key or Company ID",
        401
      );

    next();
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}
