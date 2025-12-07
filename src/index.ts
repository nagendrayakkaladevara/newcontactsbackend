import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import contactRoutes from './routes/contact.routes';
import analyticsRoutes from './routes/analytics.routes';
import documentRoutes from './routes/document.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { sanitizeInput } from './middleware/sanitize';
import { csrfProtection } from './middleware/csrf';
import { generalLimiter } from './middleware/rateLimiter';
import { config } from './config/env';

const app = express();

// Validate environment variables at startup
// This will throw an error if required vars are missing
try {
  // Config is imported, which validates env vars
  console.log('✓ Environment variables validated');
} catch (error) {
  console.error('✗ Environment variable validation failed:', error);
  process.exit(1);
}

// Security Headers (Helmet.js) - Must be first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false, // Allow iframe embedding if needed
}));

// Request ID middleware (for tracking and debugging)
app.use(requestId);

// CORS Configuration with validation
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In production, validate against allowed origins
    if (config.isProduction) {
      if (config.allowedOrigins.includes('*')) {
        console.warn('⚠️  WARNING: CORS is set to allow all origins in production!');
        return callback(null, true);
      }
      
      if (config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    }

    // In development, allow all origins
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting (apply to all routes)
app.use(generalLimiter);

// JSON parsing with error handling
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization (prevent XSS)
app.use(sanitizeInput);

// CSRF Protection (for state-changing operations)
app.use(csrfProtection);

// JSON parsing error handler (must be before routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body'
    });
  }
  next(err);
});

// Public routes (no authentication required)
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    message: 'Welcome to the Contact Management API', 
    version: '1.0.3'
  });
});

// Health check (public)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    message: 'API is healthy', 
    version: '1.0.3' 
  });
});

// CSRF token endpoint (public, for clients to get CSRF token)
import { getCsrfToken } from './middleware/csrf';
app.get('/api/csrf-token', getCsrfToken);

// Protected routes (require API key authentication)
app.use('/api/contacts', contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler (must be before error handler)
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// For Vercel serverless, don't call app.listen()
// Vercel will handle the server lifecycle
if (config.nodeEnv !== 'production' || process.env.VERCEL !== '1') {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${config.nodeEnv}`);
    console.log(`✓ CORS Origins: ${config.allowedOrigins.join(', ')}`);
    if (config.isProduction) {
      console.log(`✓ Security features enabled`);
      console.log(`✓ API Key authentication enabled`);
    } else {
      console.log(`⚠️  Development mode - API Key: ${config.apiKey.substring(0, 10)}...`);
    }
  });
}

export default app;

