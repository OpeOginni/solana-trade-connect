import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import {
  addWhitelistCollection,
  createCompany,
  loginCompanyUser,
  removeWhitelistedCollection,
  loginCompany,
  getCompany,
} from "../contollers/auth.controller";
import { accessKeyAuthMiddleware, companyAuthMiddleware } from "../middlewares/auth.middleware";

const createCompanyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 Day
  max: 5, // Limit each IP to 100 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const companyRouter = Router();

companyRouter.get("/", companyAuthMiddleware, getCompany);

companyRouter.post("/", createCompanyLimiter, createCompany);

companyRouter.post("/login", loginCompany);

companyRouter.post("/login/user", loginCompanyUser);

companyRouter.post("/whitelistCollection", accessKeyAuthMiddleware, addWhitelistCollection);

companyRouter.post("/removeCollection", accessKeyAuthMiddleware, removeWhitelistedCollection);

export default companyRouter;
