import { z } from "zod";

export const saveCompanySchema = z.object({
  companyId: z.string().uuid(),
  // companyId: z.string(),
  accessKey: z.string(),
});

export type SaveCompanyDto = z.infer<typeof saveCompanySchema>;
