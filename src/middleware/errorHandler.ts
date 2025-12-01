import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode?: number;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Sanitize error message to remove file paths and sensitive information
 */
function sanitizeErrorMessage(message: string): string {
  if (!message) return 'An error occurred';
  
  // Remove file paths (Windows and Unix)
  let sanitized = message
    .replace(/[A-Z]:\\[^\s]+/gi, '[file path]')
    .replace(/\/[^\s]+\.(ts|js|json|prisma)/g, '[file path]')
    .replace(/at\s+[^\s]+\s+\([^)]+\)/g, '[stack trace]')
    .replace(/Error:\s*/gi, '')
    .trim();

  // Common error message mappings for user-friendly messages
  const errorMappings: Record<string, string> = {
    'unique constraint': 'This record already exists',
    'foreign key constraint': 'Referenced record does not exist',
    'invalid input': 'Invalid data provided',
    'connection': 'Database connection error',
    'timeout': 'Request timeout',
    'syntax error': 'Invalid data format',
  };

  // Check for common error patterns and replace with user-friendly messages
  for (const [pattern, friendlyMessage] of Object.entries(errorMappings)) {
    if (sanitized.toLowerCase().includes(pattern)) {
      return friendlyMessage;
    }
  }

  return sanitized || 'An error occurred';
}

/**
 * Handle Prisma errors and convert to user-friendly messages
 */
function handlePrismaError(error: any): { statusCode: number; message: string } {
  // Unique constraint violation
  if (error.code === 'P2002') {
    const target = error.meta?.target;
    if (Array.isArray(target) && target.includes('phone')) {
      return {
        statusCode: 409,
        message: 'A contact with this phone number already exists'
      };
    }
    return {
      statusCode: 409,
      message: 'A record with this information already exists'
    };
  }

  // Record not found
  if (error.code === 'P2025') {
    return {
      statusCode: 404,
      message: 'Record not found'
    };
  }

  // Foreign key constraint
  if (error.code === 'P2003') {
    return {
      statusCode: 400,
      message: 'Invalid reference: related record does not exist'
    };
  }

  // Invalid input
  if (error.code === 'P2009' || error.code === 'P2010') {
    return {
      statusCode: 400,
      message: 'Invalid data format provided'
    };
  }

  // Connection/timeout errors
  if (error.code === 'P1001' || error.code === 'P1008') {
    return {
      statusCode: 503,
      message: 'Database service temporarily unavailable'
    };
  }

  // Generic Prisma error
  return {
    statusCode: 500,
    message: 'Database operation failed'
  };
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Prevent double response sending
  if (res.headersSent) {
    return next(err);
  }

  // Ensure we always send JSON, never HTML
  res.setHeader('Content-Type', 'application/json');

  // Handle null/undefined errors
  if (!err) {
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }

  try {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
      const zodIssues = err.issues;
      if (zodIssues && Array.isArray(zodIssues) && zodIssues.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: zodIssues.map((e: any) => ({
            field: (e && e.path && Array.isArray(e.path) ? e.path.join('.') : 'unknown') || 'unknown',
            message: (e && e.message) || 'Validation failed'
          }))
        });
      }
      // Fallback if issues array is missing or empty
      return res.status(400).json({
        success: false,
        message: 'Validation error'
      });
    }

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const { statusCode, message } = handlePrismaError(err);
      return res.status(statusCode).json({
        success: false,
        message
      });
    }

    // Handle Prisma client initialization errors
    if (err instanceof Prisma.PrismaClientInitializationError) {
      return res.status(503).json({
        success: false,
        message: 'Database connection error. Please try again later.'
      });
    }

    // Handle Prisma validation errors
    if (err instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format provided'
      });
    }

    // Handle JSON parsing errors
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in request body'
      });
    }

    // Handle AppError (custom application errors)
    if (err instanceof AppError) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: sanitizeErrorMessage(err.message || 'An error occurred')
      });
    }

    // Handle generic Error objects
    if (err instanceof Error) {
      const statusCode = (err as any).statusCode || 500;
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return res.status(statusCode).json({
        success: false,
        message: sanitizeErrorMessage(err.message || 'An error occurred'),
        ...(isDevelopment && {
          // Only in development: provide minimal debugging info
          error: err.name || 'Error',
          ...(err.stack && { 
            stack: err.stack
              .split('\n')
              .slice(0, 3) // Only first 3 lines of stack
              .map((line: string) => line.replace(/[A-Z]:\\[^\s]+/gi, '[file path]'))
              .join('\n')
          })
        })
      });
    }

    // Handle unknown error types
    const isDevelopment = process.env.NODE_ENV === 'development';
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
      ...(isDevelopment && { 
        error: String(err || 'Unknown error'),
        type: typeof err
      })
    });
  } catch (handlerError) {
    // If the error handler itself throws an error, send a safe generic response
    // This prevents exposing any internal errors
    // Use console.error only in development to avoid exposing errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handler failed:', handlerError);
    }
    
    // Double-check headers haven't been sent
    if (!res.headersSent) {
      try {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
          success: false,
          message: 'An unexpected error occurred'
        });
      } catch (finalError) {
        // If even this fails, just end the response
        // This should never happen, but we need to be absolutely safe
        if (!res.headersSent) {
          res.status(500).end();
        }
      }
    }
  }
};

