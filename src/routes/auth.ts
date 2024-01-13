import { Router } from "express";
import { handleLogin, handleSignUp } from "../controllers/auth";

export const authRoutes: Router = Router();

authRoutes.post("/signup", handleSignUp);
authRoutes.post("/login", handleLogin);
