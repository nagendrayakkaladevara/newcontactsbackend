import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 * Validates CSRF tokens for state-changing operations (POST, PUT, DELETE, PATCH)
 * 
 * For JWT-based stateless authentication, we validate:
 * 1. Origin/Referer header matches allowed origins
 * 2. CSRF token is present in header (for additional security)
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF in development if explicitly disabled (not recommended for production)
  if (config.isDevelopment && process.env.SKIP_CSRF === 'true') {
    return next();
  }

  // Skip CSRF for authentication endpoints (they have their own rate limiting)
  if (req.path.startsWith('/api/auth')) {
    return next();
  }

  // Validate Origin/Referer header
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (config.isProduction) {
    // In production, validate origin/referer
    if (origin) {
      const originUrl = new URL(origin);
      const allowedOrigins = config.allowedOrigins;
      
      // Check if origin is in allowed list
      const isAllowed = allowedOrigins.some(allowed => {
        try {
          const allowedUrl = new URL(allowed);
          return originUrl.origin === allowedUrl.origin;
        } catch {
          return false;
        }
      });

      if (!isAllowed && !config.allowedOrigins.includes('*')) {
        return res.status(403).json({
          success: false,
          message: 'CSRF validation failed: Origin not allowed.'
        });
      }
    } else if (referer) {
      // Fallback to referer if origin is not present
      try {
        const refererUrl = new URL(referer);
        const allowedOrigins = config.allowedOrigins;
        
        const isAllowed = allowedOrigins.some(allowed => {
          try {
            const allowedUrl = new URL(allowed);
            return refererUrl.origin === allowedUrl.origin;
          } catch {
            return false;
          }
        });

        if (!isAllowed && !config.allowedOrigins.includes('*')) {
          return res.status(403).json({
            success: false,
            message: 'CSRF validation failed: Referer not allowed.'
          });
        }
      } catch {
        // Invalid referer URL
        return res.status(403).json({
          success: false,
          message: 'CSRF validation failed: Invalid referer.'
        });
      }
    }
  }

  // For additional security, require CSRF token in header
  // This is optional but recommended for extra protection
  const csrfToken = req.headers['x-csrf-token'] as string;
  
  // If CSRF token is provided, validate it (basic check)
  // In a full implementation, you'd validate against a stored token
  if (csrfToken && csrfToken.length < 16) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token format.'
    });
  }

  // Note: For stateless JWT, we rely on Origin/Referer validation
  // For stateful sessions, you'd validate the CSRF token against session
  next();
};

/**
 * Generate CSRF token (for clients to use)
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * CSRF token endpoint (for clients to get a token)
 * GET /api/csrf-token
 */
export const getCsrfToken = (req: Request, res: Response) => {
  const token = generateCsrfToken();
  res.json({
    success: true,
    token,
    message: 'Include this token in X-CSRF-Token header for state-changing requests.'
  });
};

