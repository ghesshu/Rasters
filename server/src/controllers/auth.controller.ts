import { Request, Response } from "express";
import { UserModel } from "../models";
import { generateToken } from "../utils/jwt.utils";
import { logger } from "../utils/logger";
import { ethers } from "ethers";

export default class AuthController {
  // Wallet Authentication
  async walletAuth(req: Request, res: Response) {
    try {
      const { walletAddress, signature, message, walletType, name } = req.body;

      // Verify the signature to ensure the user owns the wallet
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({ message: "Invalid wallet signature" });
      }

      // Find or create user based on wallet address
      let user = await UserModel.findOne({ walletAddress: walletAddress.toLowerCase() });

      if (!user) {
        // Create new user with wallet
        user = new UserModel({
          walletAddress: walletAddress.toLowerCase(),
          walletType,
          name: name || `User ${walletAddress.slice(0, 6)}`,
          authProvider: "wallet",
        });
        await user.save();
      } else {
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email || '',
        authProvider: user.authProvider,
      });

      return res.json({
        message: "Wallet authentication successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress,
          walletType: user.walletType,
          authProvider: user.authProvider,
        },
      });
    } catch (error: any) {
      logger.error('Wallet auth error:', error);
      return res
        .status(500)
        .json({
          message: "Wallet authentication failed",
          error: error.message,
        });
    }
  }

  // Get nonce for wallet signature
  async getNonce(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      
      // Generate a unique nonce for this wallet
      const nonce = `Sign this message to authenticate with Rasters AI: ${Date.now()}`;
      
      return res.json({
        nonce,
        message: `Welcome to Rasters AI!\n\nClick to sign in and accept the Terms of Service.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${walletAddress}\n\nNonce:\n${Date.now()}`
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to generate nonce", error: error.message });
    }
  }

  // Logout for wallet authentication
  async logout(req: Request, res: Response) {
    try {
      // For wallet auth, we mainly just confirm the logout
      // JWT tokens are stateless, so no server-side session to clear
      logger.info('User logged out successfully');
      return res.json({ 
        message: "Logout successful",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Logout failed:', error);
      return res
        .status(500)
        .json({ message: "Logout failed", error: error.message });
    }
  }
}
