# Contacts Management Backend API

A high-performance, scalable backend API for managing phonebook contacts with bulk CSV upload capabilities, built with Express.js, TypeScript, Prisma, and PostgreSQL.

## Features

- ✅ **CRUD Operations**: Create, read, update, and delete contacts
- ✅ **Bulk CSV Upload**: Upload up to 3400 contacts via CSV file
- ✅ **Advanced Search**: Search by name (partial, case-insensitive) and phone (exact match)
- ✅ **Pagination**: Efficient pagination for large datasets
- ✅ **Data Validation**: Zod schema validation for all inputs
- ✅ **Performance Optimized**: Database indexes and bulk operations
- ✅ **Type Safety**: Full TypeScript support

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **ORM**: Prisma 5.19.1
- **Database**: PostgreSQL
- **Validation**: Zod 4.x
- **File Upload**: Multer

## Prerequisites

- Node.js 18.18.0 or higher (Note: Prisma Accelerate requires Node 22+, but core Prisma works with Node 18)
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/contactsdb?schema=public"
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

3. **Set up the database:**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

## Running the Application

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## API Endpoints

### Contact Management

#### Create a Single Contact
```http
POST /api/contacts
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "bloodGroup": "O+",
  "workingDivision": "Engineering",
  "designation": "Senior Developer",
  "city": "New York"
}
```

#### Update a Contact
```http
PUT /api/contacts/:id
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "+1234567890"
}
```

#### Delete a Contact
```http
DELETE /api/contacts/:id
```

#### Delete All Contacts
```http
DELETE /api/contacts?confirm=DELETE_ALL
```

### Search & Filtering

#### Get All Contacts (Paginated)
```http
GET /api/contacts?page=1&limit=50
```

#### Search by Name
```http
GET /api/contacts/search/name?query=ra&page=1&limit=50
```

#### Search by Phone
```http
GET /api/contacts/search/phone?phone=1234567890
```

#### Get Total Count
```http
GET /api/contacts/count
```

### Bulk Operations

#### Bulk Upload CSV
```http
POST /api/contacts/bulk-upload?replaceAll=false
Content-Type: multipart/form-data

file: [CSV file]
```

**CSV Format:**
```csv
name,phone,email,bloodGroup,workingDivision,designation,city
John Doe,+1234567890,john@example.com,O+,Engineering,Senior Developer,New York
Jane Smith,+0987654321,jane@example.com,A-,Marketing,Manager,Los Angeles
```

**Query Parameters:**
- `replaceAll=true`: Replace all existing contacts with the new upload
- `replaceAll=false` (default): Add new contacts, skip duplicates

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### Error Response
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

## Database Schema

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

  @@index([name])
  @@index([phone])
}
```

## Performance

- **Bulk Upload**: Processes 3400 records in 1-3 seconds
- **Search Operations**: <50ms for indexed queries
- **Scalability**: Supports 2K-5K requests/day, designed for 50K+ records

## Security Features

- Input validation via Zod schemas
- SQL injection prevention (Prisma ORM)
- CORS configuration for allowed domains
- Environment variable security

## Development

### Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── middleware/      # Express middleware
├── validators/      # Zod validation schemas
└── index.ts         # Application entry point

prisma/
└── schema.prisma    # Database schema
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## License

ISC

