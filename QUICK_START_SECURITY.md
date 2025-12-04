# Quick Start: Security Setup

## 🚀 Quick Setup (2 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
```env
DATABASE_URL="postgresql://user:password@localhost:5432/contactsdb?schema=public"
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
API_KEY=$(openssl rand -base64 32)
```

**Generate API Key:**
```bash
openssl rand -base64 32
```

### 3. Start Server
```bash
npm run dev
```

## 🔐 Using the API

### 1. Use API Key in Requests

**Option 1: Authorization Header (Recommended)**
```bash
curl -X GET http://localhost:3000/api/contacts \
  -H "Authorization: Bearer your-api-key-here"
```

**Option 2: X-API-Key Header**
```bash
curl -X GET http://localhost:3000/api/contacts \
  -H "X-API-Key: your-api-key-here"
```

### 2. Make Protected Requests
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Authorization: Bearer your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "1234567890"
  }'
```

### 3. Get CSRF Token (Optional)
```bash
curl -X GET http://localhost:3000/api/csrf-token
```

## 📋 Public Endpoints (No API Key Required)

- `GET /` - API info
- `GET /health` - Health check
- `GET /api/csrf-token` - CSRF token

## ⚠️ Important Notes

1. **Production**: Set `ALLOWED_ORIGINS` to specific domains (never '*')
2. **API_KEY**: Use a strong random string (generate with `openssl rand -base64 32`)
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limits**: 
   - General: 100 req/min
   - Bulk ops: 10 req/min
   - Strict ops: 3 req/min

## 🐛 Troubleshooting

**"API key required"**
- Include `Authorization: Bearer <api-key>` or `X-API-Key: <api-key>` header
- Check that `API_KEY` is set in `.env`

**"Invalid API key"**
- Verify the API key matches the one in `.env`
- Ensure no extra spaces in the API key

**"CORS error"**
- Check `ALLOWED_ORIGINS` in `.env`
- Ensure frontend origin matches exactly

**"Missing environment variable"**
- Check all required vars are in `.env`
- See `src/config/env.ts` for required vars

