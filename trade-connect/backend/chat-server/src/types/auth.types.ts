import { z } from "zod";

export const decodedTokenSchema = z.object({
  exp: z.number().optional(),
  companyId: z.string(),
  userAddress: z.string(),
});

export const loginCompanyUserSchema = z.object({
  id: z.string().uuid(),
  accessKey: z.string(),
  userAddress: z.string(),
  tokenExpiration: z.number().min(Date.now()).optional(),
});

export type DecodedTokenDto = z.infer<typeof decodedTokenSchema>;

export type LoginCompanyUserDto = z.infer<typeof loginCompanyUserSchema>;
