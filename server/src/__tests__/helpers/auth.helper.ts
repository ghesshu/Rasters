import { generateTokens } from '../../utils/jwt.utils';
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

export const generateTestTokens = (user: any) => {
    return generateTokens({
        userId: user.id,
        email: user.email,
        authProvider: user.authProvider
    });
};

export const getAuthCookies = (tokens: { accessToken: string; refreshToken: string }) => {
    return {
        accessToken: `accessToken=${tokens.accessToken}`,
        refreshToken: `refreshToken=${tokens.refreshToken}`
    };
}; 