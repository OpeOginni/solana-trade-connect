import { z } from "zod";

export const decodedTokenSchema = z.object({
  exp: z.number().optional(),
  companyId: z.string(),
  userAddress: z.string(),
});

export type DecodedTokenDto = z.infer<typeof decodedTokenSchema>;
