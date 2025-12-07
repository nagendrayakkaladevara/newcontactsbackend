import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

/**
 * Adds a unique request ID to each request
 * Helps with debugging and security incident investigation
 */
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = uuidv4();
  (req as any).id = id;
  res.setHeader('X-Request-ID', id);
  next();
};


