import { Request, Response } from "express";
import { generateAccessKey, generateUserToken } from "../lib/auth";
import { createCompanySchema, loginCompanyUserSchema, signInCompanySchema, updateWhitelistedCollectionSchema } from "../types/auth.type";
import {
  addWhitelistCollectionService,
  authenticateAccessKey,
  createCompanyService,
  removeWhitelistCollectionService,
  signInCompanyService,
  getCompanyService,
} from "../services/auth.service";
import errorHandler from "../lib/errorHandler";
import { initCompanyInfoGRPC } from "../grpc";
import CustomError from "../lib/customError";

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

    await initCompanyInfoGRPC(company.id, accessKey);

    return res.status(200).json({ success: true, company });
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}

export async function loginCompany(req: Request, res: Response) {
  try {
    // validation
    const dto = signInCompanySchema.parse(req.body);

    const { company, jwt } = await signInCompanyService(dto);
    return res.status(200).json({ success: true, company, jwt });
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}

export async function getCompany(req: Request, res: Response) {
  try {
    const resCompany = res.locals.company;

    const company = await getCompanyService(resCompany.companyId);

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

export async function loginCompanyUser(req: Request, res: Response) {
  try {
    // validation
    const dto = loginCompanyUserSchema.parse(req.body);

    const authenticated = await authenticateAccessKey(dto.id, dto.accessKey);

    if (!authenticated) throw new CustomError("Authentication Error", "Invalid Access Key", 401);

    const token = generateUserToken(dto.id, dto.userAddress, dto.tokenExpiration);

    return res.status(200).json({ success: true, token: token });
  } catch (err: any) {
    return errorHandler(err, req, res);
  }
}
