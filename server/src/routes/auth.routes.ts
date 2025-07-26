import express, { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { routeHandler } from '../utils/routeHandler';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router: Router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', routeHandler(authController.register));
router.post('/login', routeHandler(authController.login));
router.post('/google', routeHandler(authController.googleAuth));

// Protected routes
router.post('/logout', authenticate as express.RequestHandler, routeHandler(authController.logout));

export default router;