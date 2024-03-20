import dotenv from "dotenv";
dotenv.config();

import * as argon from "argon2";
import * as jwt from "jsonwebtoken";
import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "temp_secret";

// This function will hash the secret using argon2
export const hashSecret = (secret: string) => {
  return argon.hash(secret);
};

// This function will compare the secret with the hashed secret
export const compareSecret = (passedSecret: string, hashedSecret: string) => {
  return argon.verify(hashedSecret, passedSecret);
};

export const generateAccessKey = (): string => {
  const token = crypto.randomBytes(16).toString("hex");
  return token;
};

export const generateUserToken = (companyId: string, userAddress: string, exp?: number): string => {
  const signedToken = jwt.sign(
    {
      exp: exp,
      companyId: companyId,
      userAddress: userAddress,
    },
    TOKEN_SECRET
  );
  return signedToken;
};
