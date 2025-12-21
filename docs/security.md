# Security

This document describes the security features, authentication methods, and security best practices for the Contact Management API.

## Security Features

### 1. Authentication

All API endpoints (except health check) require authentication via one of the following methods:

#### API Key Authentication

**Header**: `X-API-Key`

```bash
curl -H "X-API-Key: your-api-key-here" \
  http://localhost:3000/api/contacts
```

**Configuration**: Set `API_KEY` or `API_SECRET` in `.env` file.

#### Basic Authentication

**Header**: `Authorization: Basic <base64(username:password)>`

```bash
curl -u username:password \
  http://localhost:3000/api/contacts
```

**Configuration**: Set `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` in `.env` file.

### 2. Security Headers (Helmet.js)

The API automatically sets security headers:

- **Content-Security-Policy**: Prevents XSS attacks
- **Strict-Transport-Security (HSTS)**: Forces HTTPS
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Additional XSS protection

### 3. CORS (Cross-Origin Resource Sharing)

**Configuration**: Set `ALLOWED_ORIGINS` in `.env` (comma-separated).

```env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Production**: Must specify exact origins (not `*`).

**Development**: Allows all origins for easier development.

### 4. Rate Limiting

Protection against DDoS and abuse:

- **General Endpoints**: 100 requests per minute per IP
- **Bulk Operations**: 10 requests per minute per IP
- **Strict Operations**: 5 requests per minute per IP

**Response when limit exceeded**:
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "retryAfter": 60
}
```

### 5. Input Sanitization

All user inputs are sanitized to prevent:
- XSS (Cross-Site Scripting) attacks
- SQL injection (via Prisma parameterized queries)
- Command injection

### 6. CSRF Protection

State-changing operations (POST, PUT, DELETE) require CSRF token.

**Get CSRF Token**:
```bash
GET /api/csrf-token
```

**Use CSRF Token**:
```bash
POST /api/contacts/admin/createContact
Headers:
  X-API-Key: your-api-key
  X-CSRF-Token: <token-from-csrf-endpoint>
```

### 7. Input Validation

All inputs are validated using Zod schemas:
- Type checking
- Format validation
- Length limits
- Required field validation

**Example**: Phone numbers must be 10-15 digits, match regex pattern.

## Production Security Checklist

### Environment Variables

✅ Set strong `API_KEY` (minimum 32 characters, random)
✅ Set strong `BASIC_AUTH_PASSWORD` (if using Basic auth)
✅ Set specific `ALLOWED_ORIGINS` (not `*`)
✅ Use secure `DATABASE_URL` with strong password
✅ Set `NODE_ENV=production`

### Database Security

✅ Use strong database passwords
✅ Limit database access to application server only
✅ Enable SSL for database connections (if available)
✅ Regular database backups
✅ Database user with minimal required permissions

### Network Security

✅ Use HTTPS in production (TLS 1.2+)
✅ Configure firewall rules
✅ Use reverse proxy (Nginx, Cloudflare)
✅ Enable DDoS protection

### Application Security

✅ Keep dependencies updated (`npm audit`)
✅ Regular security audits
✅ Monitor for suspicious activity
✅ Log security events
✅ Implement request size limits

## Authentication Examples

### Using API Key

```bash
# cURL
curl -H "X-API-Key: your-api-key" \
  http://localhost:3000/api/contacts

# JavaScript (Fetch)
fetch('http://localhost:3000/api/contacts', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
})

# JavaScript (Axios)
axios.get('http://localhost:3000/api/contacts', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
})
```

### Using Basic Auth

```bash
# cURL
curl -u username:password \
  http://localhost:3000/api/contacts

# JavaScript (Fetch)
fetch('http://localhost:3000/api/contacts', {
  headers: {
    'Authorization': 'Basic ' + btoa('username:password')
  }
})
```

### Using CSRF Token

```javascript
// 1. Get CSRF token
const csrfResponse = await fetch('http://localhost:3000/api/csrf-token', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});
const { token } = await csrfResponse.json();

// 2. Use CSRF token in state-changing request
const response = await fetch('http://localhost:3000/api/contacts/admin/createContact', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key',
    'X-CSRF-Token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    phone: '1234567890'
  })
});
```

## Security Best Practices

### 1. API Key Management

- **Never commit API keys to version control**
- Use environment variables
- Rotate API keys regularly
- Use different keys for different environments
- Revoke compromised keys immediately

### 2. Password Management

- Use strong, randomly generated passwords
- Store passwords in environment variables
- Never hardcode passwords
- Use password managers

### 3. HTTPS

- Always use HTTPS in production
- Redirect HTTP to HTTPS
- Use valid SSL certificates
- Enable HSTS (already configured via Helmet)

### 4. Error Handling

- Never expose sensitive information in error messages
- Log errors securely (without sensitive data)
- Use generic error messages for users
- Include request IDs for debugging

### 5. Input Validation

- Validate all inputs on the server
- Use whitelist validation (not blacklist)
- Sanitize all user inputs
- Use parameterized queries (Prisma handles this)

### 6. Rate Limiting

- Implement appropriate rate limits
- Use different limits for different endpoints
- Monitor for abuse patterns
- Implement IP blocking for repeated violations

## Security Headers Reference

The API sets the following security headers:

```
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:;
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

## Common Security Issues

### 1. Missing Authentication

**Symptom**: 401 Unauthorized

**Solution**: Include `X-API-Key` header or Basic auth credentials.

### 2. Invalid CSRF Token

**Symptom**: 403 Forbidden

**Solution**: Get CSRF token from `/api/csrf-token` and include in `X-CSRF-Token` header.

### 3. Rate Limit Exceeded

**Symptom**: 429 Too Many Requests

**Solution**: Wait for rate limit window to reset, or reduce request frequency.

### 4. CORS Error

**Symptom**: CORS policy error in browser

**Solution**: Add your origin to `ALLOWED_ORIGINS` in `.env` file.

## Security Monitoring

### Logs to Monitor

- Failed authentication attempts
- Rate limit violations
- Unusual request patterns
- Error rates
- Database query performance

### Alerts to Set Up

- Multiple failed auth attempts from same IP
- Sudden spike in requests
- Unusual error patterns
- Database connection failures

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** create a public issue
2. Contact the maintainers privately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before disclosure

## Security Updates

Keep dependencies updated:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

