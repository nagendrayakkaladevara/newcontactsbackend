import dotenv from 'dotenv';

dotenv.config();

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV'
];

// Critical for production
const productionRequiredEnvVars = [
  'ALLOWED_ORIGINS',
  'API_KEY'
];

// Validate required environment variables
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Validate production-specific variables
if (process.env.NODE_ENV === 'production') {
  productionRequiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      throw new Error(`Missing required production environment variable: ${varName}`);
    }
  });

  // Validate ALLOWED_ORIGINS is not '*'
  if (process.env.ALLOWED_ORIGINS === '*' || !process.env.ALLOWED_ORIGINS) {
    throw new Error('ALLOWED_ORIGINS must be set to specific origins in production, not "*"');
  }
}

export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || ['*'],
  port: parseInt(process.env.PORT || '3000', 10),
  apiKey: process.env.API_KEY || process.env.API_SECRET || 'change-this-api-key-in-production',
  basicAuthUsername: process.env.BASIC_AUTH_USERNAME || 'admin',
  basicAuthPassword: process.env.BASIC_AUTH_PASSWORD || 'change-this-password-in-production',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};

