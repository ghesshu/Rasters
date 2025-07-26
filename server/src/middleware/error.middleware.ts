import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler: ErrorRequestHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        logger.error(`[${err.statusCode}] ${err.message}`);
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
        return;
    }

    // Log unexpected errors
    logger.error('Unexpected error:', err);

    // Send generic error response
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
    });
}; 