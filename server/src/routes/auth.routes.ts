import express, { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { routeHandler } from "../utils/routeHandler";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";

const router: Router = express.Router();
const authController = new AuthController();

// Public routes - wallet only
router.get("/nonce/:walletAddress", routeHandler(authController.getNonce));
router.post("/wallet", routeHandler(authController.walletAuth));

// Protected routes
router.post("/logout", routeHandler(authController.logout));

export default router;
