import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = express.Router();

// Get current user profile
const profileHandler = (req: AuthRequest, res: Response): void => {
    try {
        const user = req.user;
        
        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'User not authenticated'
            });
            return;
        }

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching user profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user profile'
        });
    }
};

router.get('/me', authenticate, profileHandler);

export default router;