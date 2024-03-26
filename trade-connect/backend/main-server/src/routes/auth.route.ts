import { Router } from "express";
import { addWhitelistCollection, createCompany, loginCompanyUser, removeWhitelistedCollection, loginCompany } from "../contollers/auth.controller";
import { accessKeyAuthMiddleware } from "../middlewares/auth.middleware";

const companyRouter = Router();

companyRouter.post("/", createCompany);

companyRouter.post("/login", loginCompany);

companyRouter.post("/login/user", loginCompanyUser);

companyRouter.post("/whitelistCollection", accessKeyAuthMiddleware, addWhitelistCollection);

companyRouter.post("/removeCollection", accessKeyAuthMiddleware, removeWhitelistedCollection);

export default companyRouter;
