import { Request, Response } from "express";
import { UserModel } from "../models";
import crypto from "crypto";
import { OAuth2Client } from 'google-auth-library';
import { generateToken } from '../utils/jwt.utils';
import { authConfig } from '../config/auth.config';


const googleClient = new OAuth2Client(authConfig.google.clientId);

export default class AuthController {
  // Local Authentication
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Create new user
      const user = new UserModel({
        email,
        passwordHash: password, // Will be hashed by pre-save hook
        name,
        authProvider: 'local',
        isVerified: false // We'll implement email verification later
      });

      await user.save();

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        authProvider: user.authProvider
      });

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          authProvider: user.authProvider
        }
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      if (!user.matchPassword) {
        return res.status(500).json({ message: 'Password verification not available' });
      }

      const isValidPassword = await user.matchPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        authProvider: user.authProvider
      });

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          authProvider: user.authProvider
        }
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }

  // Google Authentication
  async googleAuth(req: Request, res: Response) {
    try {
      const { idToken } = req.body;
      
      console.log('Received request body:', req.body);
      console.log('Google Client ID:', authConfig.google.clientId);
      
      // Verify Google token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: authConfig.google.clientId
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(401).json({ message: 'Invalid Google token' });
      }

      const { email, name } = payload;

      // Find or create user
      let user = await UserModel.findOne({ email });
      
      if (!user) {
        user = new UserModel({
          email,
          name,
          authProvider: 'google',
          isVerified: true, // Google accounts are pre-verified
          googleId: payload.sub
        });
        await user.save();
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        authProvider: user.authProvider
      });

      return res.json({
        message: 'Google authentication successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          authProvider: user.authProvider
        }
      });
    } catch (error: any) {
      return res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
  }

  // Logout - client-side only now
  async logout(req: Request, res: Response) {
    try {
      // With JWT Bearer tokens, logout is handled client-side by removing the token
      return res.json({ message: 'Logout successful' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Logout failed', error: error.message });
    }
  }
}