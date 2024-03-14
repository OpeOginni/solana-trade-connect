import { z } from "zod";

export const createCompanySchema = z.object({
  companyName: z.string(),
  email: z.string().email(),
  password: z.string(),
  accessKey: z.string(),
  whitelistedCollections: z.string().array(),
});

export const signInCompanySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const addWhitelistedCollectionSchema = z.object({
  id: z.string().uuid(),
  whitelistedCollection: z.string(),
});

export const removeWhitelistedCollectionSchema = z.object({
  id: z.string().uuid(),
  whitelistedCollection: z.string(),
});

export const updateWhitelistedCollectionSchema = z.object({
  id: z.string().uuid(),
  whitelistedCollection: z.string(),
});

export type CreateCompanyDto = z.infer<typeof createCompanySchema>;
export type SignInCompanyDto = z.infer<typeof signInCompanySchema>;
export type UpdateWhitelistedCollectionsDto = z.infer<
  typeof updateWhitelistedCollectionSchema
>;
