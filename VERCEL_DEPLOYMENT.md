# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: Set up a PostgreSQL database (recommended: Vercel Postgres, Supabase, or Railway)

## Deployment Steps

### 1. Connect Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)

### 2. Configure Environment Variables

In your Vercel project settings, add these environment variables:

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
  ```
  postgresql://user:password@host:port/database?schema=public
  ```

**Optional but Recommended:**
- `ALLOWED_ORIGINS` - Comma-separated list of allowed frontend URLs
  ```
  https://your-frontend-domain.com,https://www.your-frontend-domain.com
  ```
- `NODE_ENV` - Set to `production`
- `PORT` - Usually not needed (Vercel handles this)

### 3. Configure Build Settings

Vercel should automatically detect the build settings from `vercel.json` and `package.json`.

**Build Command:** `npm install && npm run build`

The `postinstall` script will automatically generate Prisma Client.

### 4. Deploy

1. Click "Deploy" in Vercel dashboard
2. Wait for the build to complete
3. Check the deployment logs for any errors

## Troubleshooting

### Error: "FUNCTION_INVOCATION_FAILED" or "500: INTERNAL_SERVER_ERROR"

**Common Causes:**

1. **Missing DATABASE_URL**
   - Solution: Add `DATABASE_URL` environment variable in Vercel project settings

2. **Prisma Client Not Generated**
   - Solution: The `postinstall` script should handle this automatically
   - If issues persist, check build logs to ensure `prisma generate` runs

3. **Database Connection Issues**
   - Solution: Verify your `DATABASE_URL` is correct
   - Check if your database allows connections from Vercel's IP addresses
   - For Vercel Postgres, use the connection string provided by Vercel

4. **Missing Environment Variables**
   - Solution: Ensure all required environment variables are set in Vercel dashboard
   - Go to: Project Settings → Environment Variables

5. **CORS Issues**
   - Solution: Set `ALLOWED_ORIGINS` environment variable with your frontend URL(s)

### Check Deployment Logs

1. Go to your Vercel project dashboard
2. Click on the deployment
3. Check the "Build Logs" and "Function Logs" tabs
4. Look for error messages related to:
   - Prisma Client generation
   - Database connection
   - Missing environment variables

### Testing the Deployment

After deployment, test these endpoints:

1. **Health Check:**
   ```
   GET https://your-app.vercel.app/health
   ```

2. **Get Contacts:**
   ```
   GET https://your-app.vercel.app/api/contacts
   ```

## Database Setup

### Option 1: Vercel Postgres (Recommended)

1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string
4. Add it as `DATABASE_URL` environment variable

### Option 2: External Database

1. Set up PostgreSQL on:
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)
   - [Neon](https://neon.tech)
   - [AWS RDS](https://aws.amazon.com/rds/)
   - Any other PostgreSQL provider

2. Get the connection string
3. Add it as `DATABASE_URL` environment variable in Vercel

### Running Migrations

After setting up the database, run migrations:

**Option 1: Using Vercel CLI (Recommended)**
```bash
npm install -g vercel
vercel login
vercel link
npx prisma migrate deploy
```

**Option 2: Using Prisma Studio**
```bash
npx prisma studio
```

**Option 3: Direct Database Access**
Connect to your database and run the SQL migrations from `prisma/migrations/`

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ALLOWED_ORIGINS` | ⚠️ Recommended | Comma-separated frontend URLs | `https://myapp.com` |
| `NODE_ENV` | ❌ Optional | Environment mode | `production` |
| `PORT` | ❌ Optional | Server port (Vercel handles this) | `3000` |

## Additional Notes

- **Cold Starts**: Serverless functions may have cold starts. First request might be slower.
- **Connection Pooling**: For better performance, consider using Prisma Data Proxy or connection pooling.
- **File Uploads**: Multer file uploads work with Vercel, but be aware of size limits (typically 4.5MB for serverless functions).
- **Build Time**: First build may take longer due to Prisma Client generation.

## Support

If you continue to experience issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test database connection separately
4. Review Prisma documentation for serverless: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel



