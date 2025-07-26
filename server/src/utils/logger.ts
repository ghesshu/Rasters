import winston from 'winston';
import path from 'path';
import morgan from 'morgan';
import { StreamOptions } from 'morgan';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create Winston logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error'
    }));
    logger.add(new winston.transports.File({
        filename: path.join('logs', 'combined.log')
    }));
}

// Create a stream object for Morgan
const stream: StreamOptions = {
    write: (message: string) => {
        logger.info(message.trim());
    }
};

// Custom token for user ID
morgan.token('user-id', (req: Request) => {
    const authReq = req as AuthRequest;
    return authReq.user?.id || 'anonymous';
});

// Custom token for request body
morgan.token('body', (req: Request) => {
    if (req.method !== 'GET') {
        return JSON.stringify(req.body);
    }
    return '';
});

// Custom token for query parameters
morgan.token('query', (req: Request) => {
    return JSON.stringify(req.query);
});

// Development format
const devFormat = ':method :url :status :response-time ms - :user-id - :body';

// Production format
const prodFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :body :query';

// Create Morgan middleware
const morganMiddleware = morgan(
    process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
    { stream }
);

export { logger, morganMiddleware }; 