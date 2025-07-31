import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      timestamp?: number;
    }
  }
}

export const requestResponseLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Store original send method
  const originalSend = res.send;
  
  // Log request details
  const requestLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    ip: req.ip
  };
  
  console.log('REQUEST:', JSON.stringify(requestLog, null, 2));
  
  // Override send method to log response
  res.send = function (body: any) {
    // Log response details
    const responseLog = {
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
      headers: res.getHeaders(),
      body: body,
      responseTime: Date.now() - (req.timestamp || Date.now())
    };
    
    console.log('RESPONSE:', JSON.stringify(responseLog, null, 2));
    
    // Call original send method
    return originalSend.call(this, body);
  };
  
  // Add timestamp to request
  req.timestamp = Date.now();
  
  next();
};