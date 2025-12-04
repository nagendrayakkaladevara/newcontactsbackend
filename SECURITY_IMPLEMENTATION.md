# Security Implementation Guide

This document explains the security features that have been implemented and how to use them.

## ✅ Implemented Security Features

### 1. Authentication & Authorization (API Key-based)
- **Status**: ✅ Implemented
- **Location**: `src/middleware/apiKeyAuth.ts`
- **Features**:
  - Simple API key authentication
  - Constant-time comparison (prevents timing attacks)
  - Multiple ways to provide API key (Authorization header, X-API-Key header, query param)

**Usage:**
```bash
# Set API key in environment variable
API_KEY=your-secret-api-key-here

# Use API key in requests (Option 1: Authorization header)
Authorization: Bearer your-api-key-here

# Use API key in requests (Option 2: X-API-Key header)
X-API-Key: your-api-key-here

# Use API key in requests (Option 3: Query parameter - less secure)
?apiKey=your-api-key-here
```

### 2. Rate Limiting
- **Status**: ✅ Implemented
- **Location**: `src/middleware/rateLimiter.ts`
- **Limits**:
  - General API: 100 requests/minute per IP
  - Bulk operations: 10 requests/minute per IP
  - Authentication: 5 requests/minute per IP
  - Strict operations: 3 requests/minute per IP

### 3. Security Headers (Helmet.js)
- **Status**: ✅ Implemented
- **Location**: `src/index.ts`
- **Headers Set**:
  - Content Security Policy (CSP)
  - HTTP Strict Transport Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - And more...

### 4. CORS Configuration Validation
- **Status**: ✅ Implemented
- **Location**: `src/config/env.ts`, `src/index.ts`
- **Features**:
  - Validates CORS configuration at startup
  - Prevents '*' in production
  - Validates allowed origins

### 5. Input Sanitization
- **Status**: ✅ Implemented
- **Location**: `src/middleware/sanitize.ts`
- **Features**:
  - Sanitizes all user inputs (body, query, params)
  - Removes HTML tags
  - Escapes special characters
  - Prevents XSS attacks

### 6. CSRF Protection
- **Status**: ✅ Implemented
- **Location**: `src/middleware/csrf.ts`
- **Features**:
  - Validates CSRF tokens for state-changing operations
  - Requires X-CSRF-Token header for POST/PUT/DELETE

**Usage:**
```javascript
// Include CSRF token in headers
headers: {
  'X-CSRF-Token': '<csrf-token>',
  'Authorization': 'Bearer <jwt-token>'
}
```

### 7. Environment Variable Validation
- **Status**: ✅ Implemented
- **Location**: `src/config/env.ts`
- **Features**:
  - Validates required environment variables at startup
  - Ensures production-specific variables are set
  - Prevents misconfiguration

### 8. Request ID Tracking
- **Status**: ✅ Implemented
- **Location**: `src/middleware/requestId.ts`
- **Features**:
  - Adds unique request ID to each request
  - Included in response headers as `X-Request-ID`
  - Helps with debugging and security incident investigation

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file with:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/contactsdb?schema=public"
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
API_KEY=your-secret-api-key-here
```

**Generate a strong API key:**
```bash
openssl rand -base64 32
```

### 3. Start the Server
```bash
npm run dev
```

## API Endpoint Protection

### Public Endpoints (No API Key Required)
- `GET /` - API info
- `GET /health` - Health check
- `GET /api/csrf-token` - CSRF token endpoint

### Protected Endpoints (Require API Key)
All other endpoints require a valid API key. Provide it in one of these ways:
- `Authorization: Bearer <api-key>` (recommended)
- `X-API-Key: <api-key>`
- Query parameter: `?apiKey=<api-key>` (less secure)

### Access Control
- All authenticated users have full access to all endpoints
- Rate limiting applies to prevent abuse
- Bulk operations have stricter rate limits

## Testing Security Features

### Test Authentication
```bash
# 1. Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","role":"user"}'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 3. Use token to access protected endpoint
curl -X GET http://localhost:3000/api/contacts \
  -H "Authorization: Bearer <token>"
```

### Test Rate Limiting
Make multiple rapid requests to see rate limiting in action:
```bash
for i in {1..150}; do curl http://localhost:3000/api/contacts; done
```

### Test CSRF Protection
Try a POST request without CSRF token:
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"1234567890"}'
# Should return 403 Forbidden
```

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use strong JWT secrets** - Generate with `openssl rand -base64 32`
3. **Set specific CORS origins** - Never use '*' in production
4. **Rotate secrets regularly** - Change JWT_SECRET periodically
5. **Monitor rate limits** - Watch for abuse patterns
6. **Keep dependencies updated** - Run `npm audit` regularly
7. **Use HTTPS in production** - Always encrypt traffic
8. **Review logs regularly** - Check for suspicious activity

## Troubleshooting

### "Missing required environment variable" error
- Ensure all required variables are set in `.env`
- Check `src/config/env.ts` for required variables

### "CORS error" in production
- Verify `ALLOWED_ORIGINS` is set correctly
- Ensure it's not set to '*' in production
- Check that your frontend origin matches exactly

### "Authentication required" error
- Ensure you're including the Authorization header
- Check that the token hasn't expired
- Verify the token format: `Bearer <token>`

### "Insufficient permissions" error
- Check your user role
- Admin operations require 'admin' role
- Some operations require 'user' or 'admin' role

## Next Steps

Consider implementing:
- Refresh tokens for better security
- Password reset functionality
- Email verification
- Two-factor authentication (2FA)
- API key authentication for service-to-service communication
- Request logging and audit trails
- IP whitelisting/blacklisting

