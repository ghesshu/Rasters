import { generateToken } from '../../utils/jwt.utils';
import User from '../../models/user.model';

export const createTestUser = async (overrides = {}) => {
    const defaultUser = {
        email: 'test@example.com',
        passwordHash: 'password123',
        name: 'Test User',
        authProvider: 'local',
        isVerified: true
    };

    const user = new User({ ...defaultUser, ...overrides });
    await user.save();
    return user;
};

export const generateTestToken = (user: any) => {
    return generateToken({
        userId: user.id,
        email: user.email,
        authProvider: user.authProvider
    });
};

export const generateTestTokens = (user: any) => {
    const token = generateToken({
        userId: user.id,
        email: user.email,
        authProvider: user.authProvider
    });
    
    return {
        accessToken: token
    };
};

export const getAuthCookie = (token: string) => {
    return `accessToken=${token}`;
};