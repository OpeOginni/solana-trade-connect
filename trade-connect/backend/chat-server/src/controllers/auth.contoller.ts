import { Request, Response } from "express";
import { generateUserToken } from "../lib/auth";
import errorHandler from "../lib/errorHandler";
import { loginCompanyUserSchema } from "../types/auth.types";
import { authenticateAccessKey } from "../services/auth.service";
import CustomError from "../lib/customError";

export async function loginCompanyUser(req: Request, res: Response) {
  try {
    // validation
    const dto = loginCompanyUserSchema.parse(req.body);

    const authenticated = await authenticateAccessKey(dto.id, dto.accessKey);

    if (!authenticated) throw new CustomError("Authentication Error", "Invalid Access Key", 401);

    const token = generateUserToken(dto.id, dto.userAddress, dto.tokenExpiration);

    return res.status(200).json({ success: true, token: token });
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}
