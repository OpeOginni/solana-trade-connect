import z from "zod";

export const companyAccessAuthMiddlewareSchema = z.object({
  companyId: z.string().uuid(),
  accessKey: z.string().length(16),
});
export type CompanyAccessAuthMiddlewareDto = z.infer<
  typeof companyAccessAuthMiddlewareSchema
>;
