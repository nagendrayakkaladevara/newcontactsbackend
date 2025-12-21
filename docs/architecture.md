# Architecture

This document describes the system architecture, design patterns, and technical decisions of the Contact Management API.

## System Overview

The Contact Management API is built using a **layered architecture pattern**, following enterprise best practices for separation of concerns, maintainability, and scalability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│              (Web, Mobile, Postman, etc.)                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Express Application                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Middleware Stack                          │  │
│  │  • Helmet (Security Headers)                     │  │
│  │  • CORS                                           │  │
│  │  • Rate Limiting                                  │  │
│  │  • Request ID                                     │  │
│  │  • Input Sanitization                            │  │
│  │  • CSRF Protection                                │  │
│  │  • Authentication                                 │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Routes Layer                              │  │
│  │  • /api/contacts                                  │  │
│  │  • /api/documents                                 │  │
│  │  • /api/analytics                                 │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Controllers Layer                            │
│  • Request Parsing                                       │
│  • Response Formatting                                  │
│  • Error Handling                                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Services Layer                              │
│  • Business Logic                                       │
│  • Data Transformation                                  │
│  • Business Rules                                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│            Validators Layer (Zod)                        │
│  • Input Validation                                     │
│  • Type Safety                                          │
│  • Error Messages                                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Prisma ORM                                  │
│  • Database Abstraction                                 │
│  • Query Builder                                       │
│  • Type-Safe Queries                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│            PostgreSQL Database                           │
│  • Data Persistence                                     │
│  • ACID Transactions                                    │
│  • Indexes for Performance                             │
└─────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Routes Layer (`src/routes/`)

**Purpose**: Define API endpoints and HTTP methods

**Responsibilities**:
- Route registration and path definitions
- Middleware attachment (authentication, rate limiting, file upload)
- Controller method binding
- Route grouping and organization

**Example**:
```typescript
router.get('/search/name', contactController.searchByName.bind(contactController));
router.post('/admin/bulk-upload', bulkOperationLimiter, upload.single('file'), contactController.bulkUpload);
```

### 2. Controllers Layer (`src/controllers/`)

**Purpose**: Handle HTTP requests and responses

**Responsibilities**:
- Request parsing and validation
- Response formatting and status codes
- Error propagation to error handler middleware
- Input extraction from request (body, params, query)

**Pattern**: Controllers are thin - they delegate business logic to services.

### 3. Services Layer (`src/services/`)

**Purpose**: Business logic and data operations

**Responsibilities**:
- Database operations via Prisma
- Data transformation and formatting
- Business rule enforcement
- Performance optimization (bulk operations, pagination)
- Complex query building

**Pattern**: Services contain all business logic and are reusable across controllers.

### 4. Validators Layer (`src/validators/`)

**Purpose**: Input validation and type safety

**Technology**: Zod schemas

**Responsibilities**:
- Request payload validation
- Type coercion and transformation
- Error message generation
- Schema definition and reuse

### 5. Middleware (`src/middleware/`)

**Purpose**: Cross-cutting concerns

**Components**:
- `errorHandler.ts`: Centralized error handling
- `auth.ts`: Authentication (API key, Basic auth)
- `rateLimiter.ts`: Rate limiting per endpoint type
- `sanitize.ts`: Input sanitization (XSS prevention)
- `csrf.ts`: CSRF protection
- `requestId.ts`: Request tracking
- `upload.ts`: File upload handling (Multer)
- `csvParser.ts`: CSV file parsing

## Database Schema

### Contact Model

```prisma
model Contact {
  id          String   @id @default(uuid())
  name        String
  phone       String   @unique
  bloodGroup  String?
  lobby       String?
  designation String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([name])    // For name search optimization
  @@index([phone])   // For phone lookup optimization
  @@map("contacts")
}
```

**Indexes**:
- Primary Key: `id` (UUID)
- Unique Constraint: `phone` (prevents duplicates)
- Indexes: `name`, `phone` (for search performance)

### VisitCount Model

```prisma
model VisitCount {
  id        String   @id @default("singleton")
  count     Int      @default(0)
  updatedAt DateTime @updatedAt

  @@map("visit_count")
}
```

**Purpose**: Thread-safe visitor count tracking using atomic operations.

### Document Model

```prisma
model Document {
  id          String   @id @default(uuid())
  title       String
  link        String
  uploadedBy  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([title])    // For title search optimization
  @@map("documents")
}
```

## Request Flow

### Create Contact Flow

```
1. Client Request
   POST /api/contacts/admin/createContact
   Headers: X-API-Key: <key>
   Body: { name, phone, ... }

2. Middleware Stack
   ├─ Helmet (Security Headers)
   ├─ CORS
   ├─ Rate Limiting
   ├─ Request ID
   ├─ Input Sanitization
   ├─ CSRF Protection
   └─ Authentication (API Key)

3. Route Handler
   └─ contactRoutes.post('/admin/createContact', ...)

4. Controller
   ├─ Extract request body
   ├─ Validate with Zod schema
   └─ Call service

5. Service
   ├─ Check for duplicate phone
   ├─ Validate business rules
   └─ Create via Prisma

6. Database
   └─ Insert into contacts table

7. Response
   └─ Return created contact with 201 status
```

### Search Flow

```
1. Client Request
   GET /api/contacts/search/name?query=john&page=1&limit=50

2. Middleware (same as above)

3. Controller
   ├─ Extract query parameters
   ├─ Validate with searchSchema
   └─ Call service

4. Service
   ├─ Build Prisma query with filters
   ├─ Execute paginated query
   └─ Return results

5. Database
   └─ Use indexed query on name column

6. Response
   └─ Return paginated results
```

### Bulk Upload Flow

```
1. Client Request
   POST /api/contacts/admin/bulk-upload
   Content-Type: multipart/form-data
   File: contacts.csv

2. Middleware
   ├─ Rate Limiting (bulkOperationLimiter)
   ├─ File Upload (Multer)
   └─ CSV Parser

3. Controller
   ├─ Extract parsed CSV data
   └─ Call service

4. Service
   ├─ Validate all records
   ├─ Deduplicate by phone
   ├─ Batch insert/upsert
   └─ Collect errors

5. Response
   └─ Return created count and errors
```

## Error Handling Strategy

### Error Types

1. **Validation Errors (400)**: Zod schema violations
2. **Unauthorized (401)**: Missing or invalid authentication
3. **Forbidden (403)**: CSRF token invalid
4. **Not Found (404)**: Resource doesn't exist
5. **Conflict (409)**: Duplicate phone numbers
6. **Too Many Requests (429)**: Rate limit exceeded
7. **Server Errors (500)**: Unexpected errors

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "phone",
      "message": "Invalid phone number format"
    }
  ],
  "requestId": "req-123456"
}
```

### Error Handler Middleware

Centralized error handling in `src/middleware/errorHandler.ts`:
- Catches all errors
- Formats consistent error responses
- Logs errors for debugging
- Never exposes sensitive information

## Performance Optimizations

### 1. Database Indexes

- **Name Index**: Fast partial name searches
- **Phone Index**: Fast phone lookups and exact matches
- **Title Index**: Fast document title searches

### 2. Query Optimization

- Use `findMany` with `skip` and `take` for pagination
- Use `Promise.all` for parallel queries
- Use `contains` with `mode: 'insensitive'` for case-insensitive search
- Normalize phone numbers for better matching

### 3. Rate Limiting

- General endpoints: 100 requests/minute
- Bulk operations: 10 requests/minute
- Strict operations: 5 requests/minute

### 4. Bulk Operations

- Batch inserts using Prisma transactions
- Deduplication before database operations
- Error collection without stopping entire operation

## Security Architecture

### Authentication Flow

```
Client Request
  └─ X-API-Key Header or Basic Auth
     └─ auth.ts Middleware
        ├─ Validate API Key
        ├─ Validate Basic Auth
        └─ Attach user context to request
```

### Security Layers

1. **Helmet.js**: Security headers (CSP, HSTS, etc.)
2. **CORS**: Origin validation
3. **Rate Limiting**: DDoS protection
4. **Input Sanitization**: XSS prevention
5. **CSRF Protection**: State-changing operation protection
6. **Authentication**: API key or Basic auth required

## Scalability Considerations

### Horizontal Scaling

- Stateless API design (no session storage)
- Database connection pooling via Prisma
- Rate limiting per IP address

### Vertical Scaling

- Efficient database queries with indexes
- Pagination to limit response sizes
- Bulk operations for batch processing

### Future Enhancements

- Caching layer (Redis) for frequently accessed data
- Message queue for async bulk operations
- Database read replicas for analytics queries
- CDN for static document storage

## Technology Choices

### Why Express.js?

- Mature ecosystem
- Flexible middleware system
- Large community support
- Good performance

### Why Prisma?

- Type-safe database queries
- Automatic migrations
- Excellent developer experience
- Built-in connection pooling

### Why TypeScript?

- Type safety at compile time
- Better IDE support
- Easier refactoring
- Self-documenting code

### Why Zod?

- Runtime validation
- Type inference
- Great error messages
- Schema composition

## Design Patterns

### 1. Layered Architecture

Separation of concerns across layers (Routes → Controllers → Services → Database).

### 2. Dependency Injection

Services are instantiated once and reused (singleton pattern for Prisma client).

### 3. Middleware Pattern

Cross-cutting concerns handled via Express middleware.

### 4. Repository Pattern (via Prisma)

Database operations abstracted through Prisma ORM.

### 5. Error Handling Pattern

Centralized error handling with consistent response format.

## Monitoring and Observability

### Request Tracking

- Request ID middleware adds unique ID to each request
- Included in error responses for debugging

### Logging

- Console logging in development
- Structured logging ready for production (Winston, Pino)

### Health Checks

- `/health` endpoint for monitoring
- `/` endpoint for basic status

## Future Architecture Considerations

1. **Microservices**: Split into separate services (contacts, documents, analytics)
2. **Event-Driven**: Add event bus for async operations
3. **GraphQL**: Consider GraphQL API alongside REST
4. **Real-time**: WebSocket support for live updates
5. **Multi-tenancy**: Support for multiple organizations

