import z from "zod";

export const newMessageSchema = z.object({
  toAddress: z.string(),
  message: z.string(),
  timestamp: z.string().default(() => new Date().toISOString()),
});

export const storedUserSchema = z.object({
  userAddress: z.string(),
  companyId: z.string(),
  online: z.boolean(),
});

export type NewMessageDto = z.infer<typeof newMessageSchema>;
export type StoredUserDto = z.infer<typeof storedUserSchema>;
