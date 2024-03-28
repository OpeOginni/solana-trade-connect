import { Router } from "express";
import { loginCompanyUser } from "../controllers/auth.contoller";

const authRouter = Router();

authRouter.post("/login/user", loginCompanyUser);

export default authRouter;
