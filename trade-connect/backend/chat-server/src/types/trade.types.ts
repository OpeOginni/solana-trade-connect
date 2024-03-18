import { z } from "zod";

//TODO: Validate the Address String type by giving address lenght, etc
export const initializeTradeSchema = z.object({
  companyId: z.string().uuid(),
  tradeCreatorAddress: z.string(),
  tradeCreatorSwapItems: z.string().array(),
  tradeRecipientAddress: z.string(),
  tradeRecipientSwapItems: z.string().array(),
});

export const updateTradeItemsSchema = z.object({
  tradeId: z.string().uuid(),
  updaterAddress: z.string(),
  tradeCreatorSwapItems: z.string().array(),
  tradeRecipientSwapItems: z.string().array(),
});

export const acceptTradeSchema = z.object({
  tradeId: z.string().uuid(),
  updaterAddress: z.string(),
});

export type InitializeTradeDto = z.infer<typeof initializeTradeSchema>;
export type UpdateTradeItemsDto = z.infer<typeof updateTradeItemsSchema>;
export type AcceptTradeDto = z.infer<typeof acceptTradeSchema>;
