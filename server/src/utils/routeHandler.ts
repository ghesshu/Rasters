import { RequestHandler } from 'express';

// Helper function to wrap controller methods with proper typing
export const routeHandler = (handler: Function): RequestHandler => 
  async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };