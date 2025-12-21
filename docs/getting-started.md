# Getting Started

This guide will help you set up and run the Contact Management API on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.18.0 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd newcontactsbackend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including Prisma, Express, TypeScript, and other packages.

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/contactsdb?schema=public"

# Server
PORT=3000
NODE_ENV=development

# CORS (comma-separated origins, or * for all)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Authentication
API_KEY=your-secure-api-key-here
API_SECRET=your-api-secret-here

# Basic Auth (optional)
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=your-secure-password-here
```

### 4. Set Up Database

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE contactsdb;

# Exit
\q
```

#### Run Migrations

```bash
npm run prisma:migrate
```

This will:
- Create all database tables
- Set up indexes
- Apply all migrations

#### Generate Prisma Client

```bash
npm run prisma:generate
```

> **Note**: This is automatically run after `npm install` via the `postinstall` script.

### 5. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

You should see output like:
```
✓ Environment variables validated
✓ Server running on port 3000
✓ Environment: development
✓ CORS Origins: http://localhost:3000, http://localhost:5173
⚠️  Development mode - API Key: change-this...
```

## Verify Installation

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "API is healthy",
  "version": "1.0.3"
}
```

### Test API with Authentication

```bash
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/contacts/count
```

## Development Workflow

### Running in Development Mode

```bash
npm run dev
```

This uses `ts-node-dev` which:
- Automatically restarts on file changes
- Provides TypeScript compilation
- Shows helpful error messages

### Building for Production

```bash
npm run build
```

This will:
- Generate Prisma client
- Compile TypeScript to JavaScript
- Output to `dist/` directory

### Running Production Build

```bash
npm start
```

## Database Management

### Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

### Create a Migration

After modifying `prisma/schema.prisma`:

```bash
npm run prisma:migrate
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

⚠️ **Warning**: This will delete all data!

## Project Structure

```
newcontactsbackend/
├── src/
│   ├── config/          # Environment configuration
│   ├── controllers/     # Request/response handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── validators/      # Input validation schemas
│   └── index.ts         # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Migration history
├── docs/                # Documentation
├── .env                 # Environment variables (not in git)
└── package.json         # Dependencies and scripts
```

## Next Steps

- Read the [API Reference](api-reference/) to understand available endpoints
- Check [Architecture](architecture.md) for system design details
- Review [Security](security.md) for authentication and security features
- See [Development Guide](development.md) for coding standards

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

1. Change `PORT` in `.env` file
2. Or kill the process using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill
   ```

### Database Connection Error

1. Verify PostgreSQL is running:
   ```bash
   # Windows
   pg_ctl status
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Check `DATABASE_URL` in `.env` is correct
3. Verify database exists: `psql -U postgres -l`

### Prisma Client Not Generated

```bash
npm run prisma:generate
```

### TypeScript Errors

```bash
# Clean and rebuild
rm -rf dist node_modules/.prisma
npm install
npm run build
```

## Getting Help

- Check the [API Reference](api-reference/) for endpoint details
- Review [Architecture](architecture.md) for system understanding
- See [Security](security.md) for authentication issues

