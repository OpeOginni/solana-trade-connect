import { Request, Response } from "express";
import { generateAccessKey } from "../lib/auth";
import { createCompanySchema, removeWhitelistedCollectionSchema, signInCompanySchema, updateWhitelistedCollectionSchema } from "../types/auth.type";
import {
  addWhitelistCollectionService,
  createCompanyService,
  removeWhitelistCollectionService,
  signInCompanyService,
} from "../services/auth.service";
import errorHandler from "../lib/errorHandler";

export async function createCompany(req: Request, res: Response) {
  try {
    // Generate Access Key
    const accessKey = generateAccessKey();

    // validation
    const dto = createCompanySchema.parse({
      ...req.body,
      accessKey,
    });

    const company = await createCompanyService(dto);
    return res.status(200).json({ success: true, company });
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}

export async function signIn(req: Request, res: Response) {
  try {
    // validation
    const dto = signInCompanySchema.parse(req.body);

    const company = await signInCompanyService(dto);
    return res.status(200).json({ success: true, company });
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}

export async function addWhitelistCollection(req: Request, res: Response) {
  try {
    // validation
    const dto = updateWhitelistedCollectionSchema.parse(req.body);

    const whitelistedCollections = await addWhitelistCollectionService(dto);
    return res.status(200).json({ success: true, whitelistedCollections });
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}

export async function removeWhitelistedCollection(req: Request, res: Response) {
  try {
    // validation
    const dto = updateWhitelistedCollectionSchema.parse(req.body);

    const removedCollection = await removeWhitelistCollectionService(dto);
    return res.status(200).json({ success: true, removedCollection });
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}
