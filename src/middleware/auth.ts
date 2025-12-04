import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { AppError } from './errorHandler';

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

/**
 * Combined Authentication Middleware
 * Requires BOTH API Key AND Basic Authentication
 * Both methods must be provided and valid
 * 
 * Usage:
 * - API Key: X-API-Key: <api-key> (or ?apiKey=<api-key>)
 * - Basic Auth: Authorization: Basic base64(username:password)
 * 
 * Note: Since Authorization header is used for Basic Auth, API key should be provided
 * via X-API-Key header or query parameter.
 */
export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];
  const queryApiKey = req.query.apiKey;

  // Check if both authentication methods are provided
  const hasApiKey = apiKeyHeader || queryApiKey;
  const hasBasicAuth = authHeader && authHeader.startsWith('Basic ');

  // Both methods are required
  if (!hasApiKey) {
    return next(new AppError(
      'API key required. Please provide API key via X-API-Key header or ?apiKey query parameter.',
      401,
      'NO_API_KEY'
    ));
  }

  if (!hasBasicAuth) {
    return next(new AppError(
      'Basic authentication required. Please provide credentials in Authorization header (Basic base64(username:password)).',
      401,
      'NO_BASIC_AUTH'
    ));
  }

  // Validate API key
  let apiKey: string | undefined;
  if (apiKeyHeader) {
    apiKey = apiKeyHeader as string;
  } else if (queryApiKey) {
    apiKey = queryApiKey as string;
  }

  const isApiKeyValid = apiKey && constantTimeCompare(apiKey, config.apiKey);
  if (!isApiKeyValid) {
    return next(new AppError(
      'Invalid API key.',
      401,
      'INVALID_API_KEY'
    ));
  }

  // Validate Basic authentication
  const base64Credentials = authHeader!.substring(6);
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

  const isValidUsername = constantTimeCompare(username, config.basicAuthUsername);
  const isValidPassword = constantTimeCompare(password, config.basicAuthPassword);

  if (!isValidUsername || !isValidPassword) {
    return next(new AppError(
      'Invalid Basic authentication credentials.',
      401,
      'INVALID_BASIC_AUTH'
    ));
  }

  // Both authentication methods are valid
  next();
};

/**
 * Optional Authentication
 * Validates auth if provided, but doesn't require it
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];
  const queryApiKey = req.query.apiKey;

  const hasApiKey = (authHeader && authHeader.startsWith('Bearer ')) || apiKeyHeader || queryApiKey;
  const hasBasicAuth = authHeader && authHeader.startsWith('Basic ');

  // If no authentication is provided, continue without auth
  if (!hasApiKey && !hasBasicAuth) {
    return next();
  }

  // Try API key authentication
  if (hasApiKey) {
    let apiKey: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    } else if (apiKeyHeader) {
      apiKey = apiKeyHeader as string;
    } else if (queryApiKey) {
      apiKey = queryApiKey as string;
    }

    if (apiKey && constantTimeCompare(apiKey, config.apiKey)) {
      return next(); // API key is valid
    }
  }

  // Try Basic authentication
  if (hasBasicAuth) {
    const base64Credentials = authHeader!.substring(6);
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

    const isValidUsername = constantTimeCompare(username, config.basicAuthUsername);
    const isValidPassword = constantTimeCompare(password, config.basicAuthPassword);

    if (isValidUsername && isValidPassword) {
      return next(); // Basic auth is valid
    }
  }

  // If credentials were provided but invalid, return error
  return next(new AppError(
    'Invalid authentication credentials.',
    401,
    'INVALID_AUTH'
  ));
};

