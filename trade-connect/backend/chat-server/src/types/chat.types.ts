import z from "zod";

export const newMessageSchema = z.object({
  toAddress: z.string(),
  message: z.string(),
  timestamp: z
    .string()
    .optional()
    .default(() => new Date().toISOString()),
});

export const storedUserSchema = z.object({
  userAddress: z.string(),
  companyId: z.string().uuid(),
  online: z.boolean(),
});

export const getUserChatSchema = z.object({
  userAddress: z.string(),
  companyId: z.string().uuid(),
  recepientAddress: z.string(),
});

export type NewMessageInputDto = z.input<typeof newMessageSchema>;
export type NewMessageDto = z.infer<typeof newMessageSchema>;
export type StoredUserDto = z.infer<typeof storedUserSchema>;
export type GetUserChatDto = z.infer<typeof getUserChatSchema>;
