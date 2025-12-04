# Authentication Guide

This API requires **BOTH authentication methods**: API Key Authentication AND HTTP Basic Authentication. All protected endpoints require both to be provided and valid.

## 🔑 How It Works

You must provide BOTH:
1. **API Key Authentication** - Set via environment variable `API_KEY`
2. **HTTP Basic Authentication** - Set via environment variables `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD`

Both methods must be provided in every request for authentication to succeed.

## 📝 Setup

### 1. Set Authentication Credentials in Environment

Create or update your `.env` file:

```env
# API Key Authentication (REQUIRED)
API_KEY=your-secret-api-key-here

# Basic Authentication (REQUIRED)
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=your-secure-password-here
```

**Generate a strong API key:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Important:** Both `API_KEY` and Basic Auth credentials (`BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD`) are **required** and must be set in your `.env` file. All requests must include both authentication methods.

### 2. Use Authentication in Requests

**Both authentication methods must be provided in every request:**

#### API Key Authentication

Provide the API key via one of these methods:

**Option 1: X-API-Key Header (Recommended)**
```bash
X-API-Key: your-api-key-here
```

**Option 2: Query Parameter (Less Secure)**
```bash
?apiKey=your-api-key-here
```

**Note:** Since the `Authorization` header is used for Basic Auth, the API key should be provided via `X-API-Key` header or query parameter.

#### HTTP Basic Authentication

Provide credentials in the Authorization header:

```bash
Authorization: Basic base64(username:password)
```

**How to generate Basic Auth header:**
```bash
# Using cURL (automatically handles encoding)
curl -u username:password http://localhost:3000/api/contacts

# Or manually encode
echo -n "username:password" | base64
# Then use: Authorization: Basic <encoded-string>
```

**Important:** You must include BOTH headers in every request:
- `X-API-Key: <your-api-key>` (or `?apiKey=<your-api-key>`)
- `Authorization: Basic base64(username:password)`

## 📋 Example Requests

### Using cURL

**Both authentication methods are required:**

```bash
# GET request with both API key and Basic auth
curl -X GET http://localhost:3000/api/contacts \
  -H "X-API-Key: your-api-key-here" \
  -u username:password

# POST request with both API key and Basic auth
curl -X POST http://localhost:3000/api/contacts \
  -H "X-API-Key: your-api-key-here" \
  -u username:password \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "1234567890"
  }'

# Using query parameter for API key
curl -X GET "http://localhost:3000/api/contacts?apiKey=your-api-key-here" \
  -u username:password

# Manually specifying both headers
curl -X GET http://localhost:3000/api/contacts \
  -H "X-API-Key: your-api-key-here" \
  -H "Authorization: Basic $(echo -n 'username:password' | base64)"
```

### Using JavaScript/Fetch

**Both authentication methods are required:**

```javascript
// Encode username:password to base64 for Basic auth
const credentials = btoa('username:password');

// Include both API key and Basic auth headers
fetch('http://localhost:3000/api/contacts', {
  headers: {
    'X-API-Key': 'your-api-key-here',
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  }
});

// Or using query parameter for API key
fetch('http://localhost:3000/api/contacts?apiKey=your-api-key-here', {
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  }
});
```

### Using Axios

**Both authentication methods are required:**

```javascript
import axios from 'axios';

// Method 1: Using auth config for Basic auth + X-API-Key header
axios.get('http://localhost:3000/api/contacts', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  },
  auth: {
    username: 'your-username',
    password: 'your-password'
  }
});

// Method 2: Manual headers for both
const credentials = btoa('username:password');
axios.get('http://localhost:3000/api/contacts', {
  headers: {
    'X-API-Key': 'your-api-key-here',
    'Authorization': `Basic ${credentials}`
  }
});

// Method 3: API key in query parameter
axios.get('http://localhost:3000/api/contacts', {
  params: {
    apiKey: 'your-api-key-here'
  },
  auth: {
    username: 'your-username',
    password: 'your-password'
  }
});
```

## 🔒 Security Features

### ✅ What's Protected

All API endpoints except:
- `GET /` - API info
- `GET /health` - Health check
- `GET /api/csrf-token` - CSRF token endpoint

### ✅ Security Measures

1. **Constant-time comparison** - Prevents timing attacks
2. **Rate limiting** - Prevents abuse
3. **Input sanitization** - Prevents XSS
4. **CSRF protection** - Prevents cross-site attacks
5. **Security headers** - Helmet.js configured

## ⚠️ Important Notes

1. **Never commit credentials** - Keep API keys and passwords in `.env` file (already in `.gitignore`)
2. **Use HTTPS in production** - Credentials should never be sent over HTTP
3. **Rotate credentials regularly** - Change API keys and passwords periodically
4. **Use strong credentials** - Generate API keys with `openssl rand -base64 32`
5. **Don't expose in frontend** - If using in browser, use environment variables
6. **Choose the right method** - API keys are better for server-to-server, Basic auth is simpler for some tools

## 🐛 Troubleshooting

### "API key required" error
- Ensure you're including the API key via `X-API-Key` header or `?apiKey` query parameter
- Verify the API key matches `API_KEY` in your `.env` file
- Check that there are no extra spaces or characters

### "Basic authentication required" error
- Ensure you're including Basic auth credentials in the `Authorization` header
- Format must be: `Authorization: Basic base64(username:password)`
- Verify username matches `BASIC_AUTH_USERNAME` and password matches `BASIC_AUTH_PASSWORD` in `.env`

### "Invalid authentication credentials" error
- **For API key**: Check that the API key matches `API_KEY` in `.env`
- **For Basic auth**: Check that username matches `BASIC_AUTH_USERNAME` and password matches `BASIC_AUTH_PASSWORD`
- Ensure there are no extra spaces or characters
- Verify credentials haven't been changed
- **Remember**: Both API key AND Basic auth must be valid

### Environment variable not found
- Ensure `.env` file exists in the project root
- Check that `API_KEY` (or `BASIC_AUTH_USERNAME`/`BASIC_AUTH_PASSWORD`) is set in `.env`
- Restart the server after changing `.env`

### Basic Auth encoding issues
- Ensure credentials are properly base64 encoded
- Format should be `username:password` (with colon) before encoding
- Use `btoa('username:password')` in JavaScript or `echo -n 'username:password' | base64` in bash

## 🔄 Migration from JWT Auth

If you had JWT authentication before:

1. **Remove old environment variables:**
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `BCRYPT_ROUNDS`

2. **Add new environment variable:**
   - `API_KEY`

3. **Update your client code:**
   - Replace JWT token with API key
   - Use `Authorization: Bearer <api-key>` or `X-API-Key: <api-key>`

4. **No more login/register endpoints:**
   - Remove any calls to `/api/auth/login` or `/api/auth/register`
   - Just use the API key directly

## 📚 Related Documentation

- `SECURITY_IMPLEMENTATION.md` - Full security implementation details
- `QUICK_START_SECURITY.md` - Quick setup guide

