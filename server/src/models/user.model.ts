import mongoose from "mongoose";
import { User } from "../customTypes";

const userSchema = new mongoose.Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, sparse: true }, // Add sparse: true to allow multiple null values
    username: { type: String },

    // Wallet information - now required
    walletAddress: { type: String, required: true, unique: true },
    walletType: {
      type: String,
      enum: ["metamask", "walletconnect", "phantom", "other"],
      required: true,
    },

    // Remove OAuth providers since we're going wallet-only
    authProvider: {
      type: String,
      enum: ["wallet"],
      required: true,
      default: "wallet",
    },

    // Remove email verification since it's not needed for wallet auth

    // Crypto trading preferences
    preferredModels: [{ type: String }],
    tradingEnabled: { type: Boolean, default: false },
    maxTradeAmount: { type: Number },

    // API usage tracking
    apiCallsToday: { type: Number, default: 0 },
    lastApiCallDate: { type: Date },
    subscriptionTier: {
      type: String,
      enum: ["free", "basic", "pro", "enterprise"],
      required: true,
      default: "free",
    },
    subscriptionExpiry: { type: Date },

    // Timestamps
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt fields
  }
);

// Add a sparse unique index for email to allow multiple null values
userSchema.index({ email: 1 }, { unique: true, sparse: true });

// Remove password-related methods since we don't need them anymore

const UserModel = mongoose.model<User>("User", userSchema);
export { UserModel };
export default UserModel;
