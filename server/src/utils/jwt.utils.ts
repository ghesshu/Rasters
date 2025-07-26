import jwt, { SignOptions } from 'jsonwebtoken';
import { authConfig } from '../config/auth.config';

export interface TokenPayload {
    userId: string;
    email: string;
    authProvider: string;
}

export const generateToken = (payload: TokenPayload) => {
    const tokenOptions: SignOptions = {
        expiresIn: '30d' // 1 day expiry
    };

    const token = jwt.sign(payload, authConfig.jwt.secret, tokenOptions);
    return token;
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, authConfig.jwt.secret) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
};