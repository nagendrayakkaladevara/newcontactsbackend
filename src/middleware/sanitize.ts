import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

/**
 * Sanitizes user inputs to prevent XSS attacks
 * Creates sanitized versions without directly reassigning Express's internal objects
 * Stores sanitized versions in req.sanitizedQuery, req.sanitizedBody, req.sanitizedParams
 * Also updates original objects property-by-property for backward compatibility
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body - create sanitized version
  if (req.body && typeof req.body === 'object') {
    const sanitizedBody = sanitizeObject(req.body);
    // Store sanitized version in a new property
    (req as any).sanitizedBody = sanitizedBody;
    // Update original object properties for backward compatibility
    if (!Array.isArray(req.body)) {
      Object.keys(req.body).forEach(key => {
        if (sanitizedBody[key] !== undefined) {
          (req.body as any)[key] = sanitizedBody[key];
        }
      });
    } else {
      // For arrays, we need to replace the array
      req.body = sanitizedBody;
    }
  }

  // Sanitize query parameters - create sanitized version
  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = sanitizeObject(req.query);
    // Store sanitized version in a new property for direct access
    (req as any).sanitizedQuery = sanitizedQuery;
    // Update original query properties for backward compatibility
    // Instead of reassigning req.query, we update its properties one by one
    Object.keys(req.query).forEach(key => {
      const sanitizedValue = sanitizedQuery[key];
      if (sanitizedValue !== undefined) {
        (req.query as any)[key] = sanitizedValue;
      }
    });
  }

  // Sanitize URL parameters - create sanitized version
  if (req.params && typeof req.params === 'object') {
    const sanitizedParams = sanitizeObject(req.params);
    // Store sanitized version in a new property for direct access
    (req as any).sanitizedParams = sanitizedParams;
    // Update original params properties for backward compatibility
    Object.keys(req.params).forEach(key => {
      const sanitizedValue = sanitizedParams[key];
      if (sanitizedValue !== undefined) {
        req.params[key] = sanitizedValue;
      }
    });
  }

  next();
};

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeValue(item));
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeValue(obj[key]);
      }
    }
    return sanitized;
  }

  return sanitizeValue(obj);
}

/**
 * Sanitize a single value
 */
function sanitizeValue(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    // Remove HTML tags and escape special characters
    let sanitized = validator.escape(value);
    // Remove any remaining HTML tags
    sanitized = validator.stripLow(sanitized, true);
    // Trim whitespace
    sanitized = sanitized.trim();
    return sanitized;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  }

  if (typeof value === 'object') {
    return sanitizeObject(value);
  }

  return value;
}

/**
 * Sanitize phone number specifically
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Remove all non-digit characters except +
  let sanitized = phone.trim();
  const hasPlus = sanitized.startsWith('+');
  
  if (hasPlus) {
    sanitized = '+' + sanitized.substring(1).replace(/\D/g, '');
  } else {
    sanitized = sanitized.replace(/\D/g, '');
  }
  
  return sanitized;
}

/**
 * Sanitize name field (allows letters, spaces, hyphens, apostrophes)
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  // Remove HTML tags and escape
  let sanitized = validator.escape(name);
  // Remove any characters that aren't letters, spaces, hyphens, or apostrophes
  sanitized = sanitized.replace(/[^a-zA-Z\s\-']/g, '');
  // Trim and normalize whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ');
  
  return sanitized;
}

