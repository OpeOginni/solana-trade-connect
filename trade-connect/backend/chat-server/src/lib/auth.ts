import dotenv from "dotenv";
dotenv.config();

import * as jwt from "jsonwebtoken";
import { decodedTokenSchema } from "../types/auth.types";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "temp_secret";

export const verifyUserToken = (token: string) => {
  const decoded = jwt.verify(token, TOKEN_SECRET);

  const tokenPayload = decodedTokenSchema.parse(decoded);
  return tokenPayload;
};
