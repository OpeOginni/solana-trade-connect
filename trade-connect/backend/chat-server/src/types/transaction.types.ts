import { z } from "zod";

//TODO: Validate the Address String type by giving address lenght, etc
export const signedDepositTransactionSchema = z.object({
  tradeId: z.string().uuid(),
  signerAddress: z.string(),
});

export type SignedDepositTransactionDto = z.infer<typeof signedDepositTransactionSchema>;
