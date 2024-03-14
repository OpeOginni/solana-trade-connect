import { Company } from "@prisma/client";
import db from "../db";
import { compareSecret, hashSecret } from "../lib/auth";
import {
  CreateCompanyDto,
  SignInCompanyDto,
  UpdateWhitelistedCollectionsDto,
} from "../types/auth.type";
import CustomError from "../lib/customError";

export async function createCompanyService(dto: CreateCompanyDto) {
  dto.password = await hashSecret(dto.password);

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

  // TODO: Dont return access key
  return newCompany;
}

export async function signInCompanyService(dto: SignInCompanyDto) {
  const company = await db.company.findFirstOrThrow({
    where: {
      email: dto.email,
    },
  });

  if (!(await compareSecret(dto.password, company.password)))
    throw new CustomError("Sign In Error", "Incorrect Email or Password", 500);

  //TODO: Send in JWT to be stored

  return company;
}

export async function addWhitelistCollectionService(
  dto: UpdateWhitelistedCollectionsDto
) {
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
      whitelistedCollections: [
        ...company.whitelistedCollections,
        dto.whitelistedCollection,
      ],
    },
  });

  return updatedCompany.whitelistedCollections;
}

export async function removeWhitelistCollectionService(
  dto: UpdateWhitelistedCollectionsDto
) {
  const company = await db.company.findFirstOrThrow({
    where: {
      id: dto.id,
    },
  });

  const index = company.whitelistedCollections.indexOf(
    dto.whitelistedCollection
  );

  if (index === -1)
    throw new CustomError("Remove Error", "Invalid Collection", 400);

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
