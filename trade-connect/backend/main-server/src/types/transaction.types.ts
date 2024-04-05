import { z } from "zod";

export type SerializedTransactionDTO = {
  transactionBase58: string;
};

export const signedDepositTransactionSchema = z.object({
  tradeId: z.string().uuid(),
  signerAddress: z.string(),
});

export type SignedDepositTransactionDto = z.infer<typeof signedDepositTransactionSchema>;
