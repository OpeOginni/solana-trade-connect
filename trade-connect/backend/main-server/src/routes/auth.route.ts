import { Router } from "express";
import {
  addWhitelistCollection,
  createCompany,
  loginCompanyUser,
  removeWhitelistedCollection,
  loginCompany,
  getCompany,
} from "../contollers/auth.controller";
import { accessKeyAuthMiddleware, companyAuthMiddleware } from "../middlewares/auth.middleware";

const companyRouter = Router();

companyRouter.get("/", companyAuthMiddleware, getCompany);

companyRouter.post("/", createCompany);

companyRouter.post("/login", loginCompany);

companyRouter.post("/login/user", loginCompanyUser);

companyRouter.post("/whitelistCollection", accessKeyAuthMiddleware, addWhitelistCollection);

companyRouter.post("/removeCollection", accessKeyAuthMiddleware, removeWhitelistedCollection);

export default companyRouter;
