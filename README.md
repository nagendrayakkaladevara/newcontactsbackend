# Contact Management API

A production-ready, enterprise-grade RESTful API for managing contacts, documents, and analytics. Built with TypeScript, Express.js, Prisma, and PostgreSQL.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

## ✨ Features

- **Contact Management**: Full CRUD operations with advanced search and filtering
- **Bulk Operations**: Upload contacts via CSV or JSON (up to 1000 per request)
- **Document Management**: Store and manage documents with search capabilities
- **Analytics Dashboard**: Comprehensive analytics and insights
- **Security**: API key authentication, rate limiting, CSRF protection, input sanitization
- **Performance**: Database indexing, optimized queries, pagination
- **Type Safety**: Full TypeScript support with Zod validation

## 📚 Documentation

- **[Getting Started](docs/getting-started.md)** - Installation and setup guide
- **[API Reference](docs/api-reference/)** - Complete API documentation
  - [Contacts API](docs/api-reference/contacts.md)
  - [Documents API](docs/api-reference/documents.md)
  - [Analytics API](docs/api-reference/analytics.md)
- **[Architecture](docs/architecture.md)** - System design and architecture
- **[Security](docs/security.md)** - Security features and best practices
- **[Deployment](docs/deployment.md)** - Production deployment guide
- **[Development](docs/development.md)** - Development workflow and guidelines

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma 5.19.1
- **Database**: PostgreSQL
- **Validation**: Zod 4.x
- **Security**: Helmet, express-rate-limit

## 📋 Prerequisites

- Node.js 18.18.0 or higher
- PostgreSQL database
- npm or yarn

## 🔐 Authentication

All API endpoints (except health check) require authentication via:
- **API Key**: `X-API-Key` header
- **Basic Auth**: Username/password

See [Security Documentation](docs/security.md) for details.

## 📖 API Endpoints Overview

### Contacts
- `GET /api/contacts` - List contacts (paginated)
- `GET /api/contacts/search/name` - Search by name
- `GET /api/contacts/search/phone` - Search by phone
- `GET /api/contacts/filter` - Filter by blood group, lobby, designation
- `POST /api/contacts/admin/createContact` - Create contact
- `POST /api/contacts/admin/bulk-upload` - Bulk upload CSV
- `POST /api/contacts/admin/bulk` - Bulk create JSON

### Documents
- `GET /api/documents` - List documents (paginated)
- `GET /api/documents/search` - Search documents
- `POST /api/documents/admin/createDocument` - Create document
- `POST /api/documents/admin/bulk` - Bulk create documents

### Analytics
- `GET /api/analytics/overview` - Overview statistics
- `GET /api/analytics/blood-groups` - Blood group distribution
- `GET /api/analytics/lobbies` - Lobby distribution
- `GET /api/analytics/growth` - Contact growth trends

See [API Reference](docs/api-reference/) for complete documentation.

## 🏗 Project Structure

```
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── validators/      # Zod schemas
│   └── index.ts         # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
└── docs/                # Documentation
```

## 🧪 Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

## 📝 License

ISC

## 🤝 Support

For issues, questions, or contributions, please refer to the [Development Guide](docs/development.md).

---

**Version**: 1.0.3

