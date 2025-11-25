# Architecture Documentation

## System Architecture

### Overview
This is a RESTful API backend built with a layered architecture pattern, designed for high performance, scalability, and maintainability.

### Architecture Layers

```
┌─────────────────────────────────────┐
│         Express Routes              │  (API Endpoints)
├─────────────────────────────────────┤
│         Controllers                 │  (Request/Response Handling)
├─────────────────────────────────────┤
│         Services                    │  (Business Logic)
├─────────────────────────────────────┤
│         Validators (Zod)            │  (Input Validation)
├─────────────────────────────────────┤
│         Prisma ORM                  │  (Database Abstraction)
├─────────────────────────────────────┤
│         PostgreSQL                  │  (Data Persistence)
└─────────────────────────────────────┘
```

## Component Details

### 1. Routes Layer (`src/routes/`)
- **Purpose**: Define API endpoints and HTTP methods
- **Responsibilities**:
  - Route registration
  - Middleware attachment (upload, CSV parsing)
  - Controller method binding

### 2. Controllers Layer (`src/controllers/`)
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**:
  - Request parsing
  - Response formatting
  - Error propagation to middleware
  - Status code management

### 3. Services Layer (`src/services/`)
- **Purpose**: Business logic and data operations
- **Responsibilities**:
  - Database operations via Prisma
  - Data transformation
  - Business rule enforcement
  - Performance optimization (bulk operations, pagination)

### 4. Validators Layer (`src/validators/`)
- **Purpose**: Input validation and type safety
- **Technology**: Zod schemas
- **Responsibilities**:
  - Request payload validation
  - Type coercion
  - Error message generation

### 5. Middleware (`src/middleware/`)
- **errorHandler.ts**: Centralized error handling
- **upload.ts**: File upload handling (Multer)
- **csvParser.ts**: CSV file parsing

## Database Schema

### Contact Model
```prisma
model Contact {
  id              String   @id @default(uuid())
  name            String
  phone           String   @unique
  email           String?
  bloodGroup      String?
  workingDivision String?
  designation     String?
  city            String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([name])    // For name search optimization
  @@index([phone])   // For phone lookup optimization
  @@map("contacts")
}
```

### Indexes
- **Primary Key**: `id` (UUID)
- **Unique Constraint**: `phone` (prevents duplicates)
- **Indexes**: `name`, `phone` (for search performance)

## API Design

### RESTful Conventions
- **GET**: Retrieve resources
- **POST**: Create resources
- **PUT**: Update resources
- **DELETE**: Remove resources

### Endpoint Structure
```
/api/contacts              - List all (paginated)
/api/contacts/:id          - Get/Update/Delete single
/api/contacts/count        - Get total count
/api/contacts/search/name  - Search by name
/api/contacts/search/phone - Search by phone
/api/contacts/bulk-upload   - Bulk CSV upload
```

## Performance Optimizations

### 1. Database Indexes
- Indexed `name` column for fast partial searches
- Indexed `phone` column for exact match lookups
- Unique constraint on `phone` for duplicate prevention

### 2. Bulk Operations
- **Replace All Mode**: Uses `createMany()` for maximum performance
- **Incremental Mode**: Uses batched `upsert()` transactions (500 records per batch)
- Validates and deduplicates before database operations

### 3. Pagination
- Default: 50 records per page
- Configurable via query parameters
- Efficient `skip/take` with parallel count query

### 4. Search Optimization
- Case-insensitive name search using PostgreSQL `ILIKE`
- Indexed phone lookups for exact matches
- Paginated results to limit data transfer

## Security Measures

### 1. Input Validation
- All inputs validated with Zod schemas
- Type coercion and sanitization
- Detailed error messages for invalid inputs

### 2. SQL Injection Prevention
- Prisma ORM parameterized queries
- No raw SQL string concatenation

### 3. CORS Configuration
- Configurable allowed origins
- Environment-based configuration

### 4. Error Handling
- No sensitive information in production error messages
- Structured error responses
- Proper HTTP status codes

## Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: No server-side session storage
- **Database Connection Pooling**: Prisma handles connection management
- **Load Balancer Ready**: All endpoints are stateless

### Vertical Scaling
- Efficient database queries
- Indexed columns for fast lookups
- Bulk operations optimized for large datasets

### Future Enhancements
- Redis caching for frequently accessed data
- Database read replicas for read-heavy workloads
- Message queue for async bulk operations

## Data Flow

### Create Contact Flow
```
Client Request
  → Route Handler
  → Controller (validate request)
  → Zod Validator (validate schema)
  → Service (check duplicates)
  → Prisma (insert to DB)
  → Controller (format response)
  → Client Response
```

### Bulk Upload Flow
```
Client Upload
  → Multer Middleware (file handling)
  → CSV Parser (parse file)
  → Controller (extract data)
  → Service (validate all records)
  → Service (deduplicate)
  → Prisma (bulk insert/upsert)
  → Controller (format response with errors)
  → Client Response
```

### Search Flow
```
Client Request
  → Route Handler
  → Controller (extract query params)
  → Zod Validator (validate params)
  → Service (build Prisma query)
  → Prisma (execute indexed query)
  → Service (paginate results)
  → Controller (format response)
  → Client Response
```

## Error Handling Strategy

### Error Types
1. **Validation Errors** (400): Zod schema violations
2. **Not Found** (404): Resource doesn't exist
3. **Conflict** (409): Duplicate phone numbers
4. **Server Errors** (500): Unexpected errors

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
  ]
}
```

## Testing Strategy (Future)

### Unit Tests
- Service layer business logic
- Validator schemas
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- File upload handling

### Performance Tests
- Bulk upload with 3400 records
- Search query performance
- Concurrent request handling

## Deployment Considerations

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: CORS allowed origins

### Database Migrations
- Prisma migrations for schema changes
- Version-controlled migration files
- Rollback support

### Build Process
```bash
npm run build    # TypeScript compilation
npm start        # Production server
```

## Monitoring & Logging (Future)

### Recommended Additions
- Request logging middleware
- Performance metrics collection
- Error tracking (e.g., Sentry)
- Database query logging
- Health check endpoints

