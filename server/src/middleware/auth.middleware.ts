import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";
import User from "../models/user.model";

export interface AuthRequest extends Request {
  user?: any; // Using any for now since we don't have the User type properly exported
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    // logger.info(user);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  next();
};
