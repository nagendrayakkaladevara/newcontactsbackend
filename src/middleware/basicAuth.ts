import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { AppError } from './errorHandler';

/**
 * HTTP Basic Authentication Middleware
 * Validates username and password from Authorization header
 * 
 * Usage:
 * - Header: Authorization: Basic base64(username:password)
 */
export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return next(new AppError(
      'Basic authentication required. Please provide credentials in Authorization header (Basic base64(username:password)).',
      401,
      'NO_BASIC_AUTH'
    ));
  }

  // Extract and decode credentials
  const base64Credentials = authHeader.substring(6);
  let credentials: string;
  
  try {
    credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  } catch (error) {
    return next(new AppError(
      'Invalid Basic authentication format.',
      401,
      'INVALID_BASIC_AUTH_FORMAT'
    ));
  }

  const [username, password] = credentials.split(':');

  if (!username || !password) {
    return next(new AppError(
      'Invalid Basic authentication credentials format. Expected username:password.',
      401,
      'INVALID_BASIC_AUTH_FORMAT'
    ));
  }

  // Validate credentials using constant-time comparison
  const isValidUsername = constantTimeCompare(username, config.basicAuthUsername);
  const isValidPassword = constantTimeCompare(password, config.basicAuthPassword);

  if (!isValidUsername || !isValidPassword) {
    return next(new AppError(
      'Invalid Basic authentication credentials.',
      401,
      'INVALID_BASIC_AUTH'
    ));
  }

  // Credentials are valid, continue
  next();
};

/**
 * Optional Basic Authentication
 * Validates Basic auth if provided, but doesn't require it
 */
export const optionalBasicAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return next(); // No basic auth provided, continue
  }

  // Extract and decode credentials
  const base64Credentials = authHeader.substring(6);
  let credentials: string;
  
  try {
    credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  } catch (error) {
    return next(new AppError(
      'Invalid Basic authentication format.',
      401,
      'INVALID_BASIC_AUTH_FORMAT'
    ));
  }

  const [username, password] = credentials.split(':');

  if (!username || !password) {
    return next(new AppError(
      'Invalid Basic authentication credentials format.',
      401,
      'INVALID_BASIC_AUTH_FORMAT'
    ));
  }

  // Validate credentials
  const isValidUsername = constantTimeCompare(username, config.basicAuthUsername);
  const isValidPassword = constantTimeCompare(password, config.basicAuthPassword);

  if (!isValidUsername || !isValidPassword) {
    return next(new AppError(
      'Invalid Basic authentication credentials.',
      401,
      'INVALID_BASIC_AUTH'
    ));
  }

  next();
};

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

