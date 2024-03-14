import { Router } from "express";
import { addWhitelistCollection, createCompany, removeWhitelistedCollection, signIn } from "../contollers/auth.controller";
import { accessKeyAuthMiddleware } from "../middlewares/auth.middleware";

const companyRouter = Router();

companyRouter.post("/", createCompany);

companyRouter.post("/login", signIn);

companyRouter.post("/whitelistCollection", accessKeyAuthMiddleware, addWhitelistCollection);

companyRouter.post("/removeCollection", accessKeyAuthMiddleware, removeWhitelistedCollection);

export default companyRouter;
