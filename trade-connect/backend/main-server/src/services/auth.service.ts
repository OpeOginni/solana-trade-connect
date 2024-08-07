import { Company } from "@prisma/client";
import db from "../db";
import { compareSecret, generateCompanyToken, hashSecret } from "../lib/auth";
import { CreateCompanyDto, SignInCompanyDto, UpdateWhitelistedCollectionsDto } from "../types/auth.type";
import CustomError from "../lib/customError";
// import { initCompanyInfoGRPC } from "../grpc/client";

export async function createCompanyService(dto: CreateCompanyDto) {
  dto.password = await hashSecret(dto.password);

  const exisitingCompany = await db.company.findUnique({
    where: {
      email: dto.email,
    },
  });

  if (exisitingCompany) throw new CustomError("Sign Up Error", "Account already created with Email", 400);

  const newCompany: Company = await db.company.create({
    data: {
      email: dto.email,
      companyName: dto.companyName,
      password: dto.password,
      whitelistedCollections: dto.whitelistedCollections,
    },
  });

  const newAccessKey = await db.accessKey.create({
    data: {
      accessKey: dto.accessKey,
      companyId: newCompany.id,
    },
  });

  // Make GRPC CLIENT CALL TO INIT COMPANY INFO in Chat Server
  // await initCompanyInfoGRPC(newCompany.id, newAccessKey.accessKey);

  // TODO: Dont return access key
  return newCompany;
}

export async function signInCompanyService(dto: SignInCompanyDto) {
  const company = await db.company.findFirstOrThrow({
    where: {
      email: dto.email,
    },
  });

  if (!(await compareSecret(dto.password, company.password))) throw new CustomError("Sign In Error", "Incorrect Email or Password", 401);

  //TODO: Send in JWT to be stored

  const jwt = generateCompanyToken(company.id);

  return { company, jwt };
}

export async function addWhitelistCollectionService(dto: UpdateWhitelistedCollectionsDto) {
  const company = await db.company.findFirstOrThrow({
    where: {
      id: dto.id,
    },
  });

  const updatedCompany = await db.company.update({
    where: {
      id: dto.id,
    },
    data: {
      whitelistedCollections: [...company.whitelistedCollections, dto.collection],
    },
  });

  return updatedCompany.whitelistedCollections;
}

export async function removeWhitelistCollectionService(dto: UpdateWhitelistedCollectionsDto) {
  const company = await db.company.findFirstOrThrow({
    where: {
      id: dto.id,
    },
  });

  const index = company.whitelistedCollections.indexOf(dto.collection);

  if (index === -1) throw new CustomError("Remove Error", "Invalid Collection", 400);

  const removedCollection = company.whitelistedCollections.splice(index)[0];

  const updatedCompany = await db.company.update({
    where: {
      id: dto.id,
    },
    data: {
      whitelistedCollections: [...company.whitelistedCollections],
    },
  });

  return removedCollection;
}

export async function authenticateAccessKey(companyId: string, accessKey: string) {
  const access = await db.accessKey.findUnique({
    where: {
      companyId_accessKey: {
        companyId,
        accessKey,
      },
    },
  });

  if (!access) return false;
  return true;
}

export async function getCompanyService(companyId: string) {
  const company = await db.company.findUnique({
    where: {
      id: companyId,
    },
    select: {
      accessKey: true,
      companyName: true,
    },
  });

  return company;
}
