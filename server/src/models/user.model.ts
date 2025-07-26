import mongoose from 'mongoose';
import { User } from '../customTypes';
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    username: { type: String },
    
    // OAuth providers
    googleId: { type: String },
    authProvider: { 
        type: String, 
        enum: ['local', 'google', 'wallet'],
        required: true,
        default: 'local'
    },
    
    // Wallet information
    walletAddress: { type: String },
    walletType: { 
        type: String,
        enum: ['metamask', 'walletconnect', 'phantom', 'other']
    },
    
    // Email verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    
    // Crypto trading preferences
    preferredModels: [{ type: String }],
    tradingEnabled: { type: Boolean, default: false },
    maxTradeAmount: { type: Number },
    
    // API usage tracking
    apiCallsToday: { type: Number, default: 0 },
    lastApiCallDate: { type: Date },
    subscriptionTier: { 
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise'],
        required: true,
        default: 'free'
    },
    subscriptionExpiry: { type: Date },
    
    // Timestamps
    lastLoginAt: { type: Date }
}, {
    timestamps: true // This automatically adds createdAt and updatedAt fields
});

userSchema.pre("save", async function (next) {
    if (this.isModified("passwordHash") && this.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
    if (!this.passwordHash) return false;
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export default mongoose.model<User>('User', userSchema);