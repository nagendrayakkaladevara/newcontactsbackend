# Deployment Guide

This guide covers deploying the Contact Management API to production environments.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Security settings reviewed
- [ ] API keys generated and secured
- [ ] CORS origins configured
- [ ] Rate limits configured
- [ ] SSL/TLS certificates ready
- [ ] Monitoring and logging set up

## Environment Variables

### Required Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
NODE_ENV=production
```

### Production-Required Variables

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
API_KEY=your-strong-random-api-key-minimum-32-characters
API_SECRET=your-api-secret
```

### Optional Variables

```env
PORT=3000
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=your-strong-password
```

## Build Process

### 1. Install Dependencies

```bash
npm ci  # Use ci for production (clean install)
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Run Database Migrations

```bash
npm run prisma:migrate
```

### 4. Build TypeScript

```bash
npm run build
```

This creates the `dist/` directory with compiled JavaScript.

## Deployment Options

### Option 1: Traditional Server (PM2)

#### Install PM2

```bash
npm install -g pm2
```

#### Start Application

```bash
pm2 start dist/index.js --name contacts-api
```

#### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'contacts-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

Start with config:
```bash
pm2 start ecosystem.config.js
```

#### PM2 Commands

```bash
pm2 list              # List processes
pm2 logs              # View logs
pm2 restart contacts-api
pm2 stop contacts-api
pm2 delete contacts-api
pm2 save              # Save process list
pm2 startup           # Enable startup on boot
```

### Option 2: Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy application files
COPY dist ./dist

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

#### Build and Run

```bash
# Build image
docker build -t contacts-api .

# Run container
docker run -d \
  --name contacts-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NODE_ENV=production \
  -e API_KEY="your-api-key" \
  contacts-api
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/contactsdb
      - NODE_ENV=production
      - API_KEY=${API_KEY}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=contactsdb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

### Option 3: Vercel (Serverless)

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Environment Variables

Set in Vercel dashboard:
- `DATABASE_URL`
- `API_KEY`
- `ALLOWED_ORIGINS`
- Other required variables

### Option 4: AWS (EC2/ECS/Lambda)

#### EC2 Deployment

1. Launch EC2 instance
2. Install Node.js and PostgreSQL
3. Clone repository
4. Set environment variables
5. Run migrations
6. Start with PM2

#### ECS Deployment

1. Build Docker image
2. Push to ECR
3. Create ECS task definition
4. Create ECS service
5. Configure load balancer

#### Lambda Deployment

Requires serverless framework or AWS SAM. See serverless documentation.

## Reverse Proxy (Nginx)

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Setup

### Production Database

1. **Create Database**:
   ```sql
   CREATE DATABASE contactsdb;
   ```

2. **Create User**:
   ```sql
   CREATE USER contacts_user WITH PASSWORD 'strong_password';
   GRANT ALL PRIVILEGES ON DATABASE contactsdb TO contacts_user;
   ```

3. **Run Migrations**:
   ```bash
   npm run prisma:migrate
   ```

### Database Backups

#### Automated Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U user contactsdb > /backups/contactsdb_$DATE.sql
```

#### Restore

```bash
psql -U user contactsdb < /backups/contactsdb_20240101_120000.sql
```

## Monitoring

### Health Checks

Monitor the health endpoint:
```bash
curl https://api.yourdomain.com/health
```

### Logging

#### Application Logs

Use PM2 logs or Docker logs:
```bash
pm2 logs contacts-api
docker logs contacts-api
```

#### Structured Logging

Consider using:
- Winston
- Pino
- CloudWatch (AWS)
- Datadog
- New Relic

### Metrics to Monitor

- Response times
- Error rates
- Request rates
- Database connection pool
- Memory usage
- CPU usage

## SSL/TLS

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com
```

### Auto-renewal

```bash
# Add to crontab
0 0 * * * certbot renew --quiet
```

## Security Hardening

### 1. Firewall

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 2. Database Security

- Use strong passwords
- Limit database access to application server
- Enable SSL for database connections
- Regular security updates

### 3. Application Security

- Keep dependencies updated: `npm audit fix`
- Regular security audits
- Monitor for suspicious activity
- Implement request size limits

## Scaling

### Horizontal Scaling

- Use load balancer (Nginx, AWS ALB)
- Multiple application instances
- Database connection pooling
- Stateless application design

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Add database indexes
- Use caching (Redis)

## Troubleshooting

### Application Won't Start

1. Check environment variables
2. Verify database connection
3. Check logs for errors
4. Verify Prisma client generated

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check database is running
3. Verify network connectivity
4. Check firewall rules

### Performance Issues

1. Check database indexes
2. Review query performance
3. Monitor resource usage
4. Check rate limiting

## Rollback Procedure

1. Stop current version
2. Restore previous version
3. Run database migrations (if needed)
4. Restart application
5. Verify health check

## Post-Deployment

1. Verify health endpoint
2. Test critical endpoints
3. Monitor error logs
4. Check performance metrics
5. Verify SSL certificate

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Review security logs weekly
- Database backups daily
- Performance monitoring continuously

### Updates

1. Test in staging
2. Backup database
3. Deploy to production
4. Monitor for issues
5. Rollback if needed

