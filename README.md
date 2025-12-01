# Contacts Management Backend API

A high-performance, scalable backend API for managing phonebook contacts with bulk CSV upload capabilities, built with Express.js, TypeScript, Prisma, and PostgreSQL.

## Features

- ✅ **CRUD Operations**: Create, read, update, and delete contacts
- ✅ **Bulk Operations**: Upload via CSV file or JSON array (up to 1000 contacts per request)
- ✅ **Advanced Search**: Search by name (partial, case-insensitive), phone (exact match)
- ✅ **Unified Filtering**: Filter contacts by bloodGroup, lobby, and/or designation in a single endpoint
- ✅ **Blood Group Management**: Get all unique blood groups
- ✅ **Lobby Management**: Get all unique lobbies
- ✅ **Designation Management**: Get all unique designations
- ✅ **Analytics Dashboard**: Comprehensive analytics endpoints for data visualization and insights
- ✅ **Visit Tracking**: Thread-safe visitor count tracking with atomic operations
- ✅ **Pagination**: Efficient pagination for large datasets
- ✅ **Data Validation**: Zod schema validation for all inputs
- ✅ **Performance Optimized**: Database indexes and bulk operations
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Secure Error Handling**: No sensitive information exposed in error responses

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

# After adding visit count feature, run:
npx prisma migrate dev --name add_visit_count

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

### Health Check

#### Health Check
```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-25T12:00:00.000Z"
}
```

### Contact Management

#### Create a Single Contact
```http
POST /api/contacts
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "bloodGroup": "O+",
  "lobby": "Engineering",
  "designation": "Senior Developer"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "phone": "+1234567890",
    "bloodGroup": "O+",
    "lobby": "Engineering",
    "designation": "Senior Developer",
    "createdAt": "2025-01-25T12:00:00.000Z",
    "updatedAt": "2025-01-25T12:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "phone",
      "message": "Invalid phone number format"
    }
  ]
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Contact with this phone number already exists"
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

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe Updated",
    "phone": "+1234567890",
    "bloodGroup": "O+",
    "lobby": "Engineering",
    "designation": "Senior Developer",
    "createdAt": "2025-01-25T12:00:00.000Z",
    "updatedAt": "2025-01-25T12:05:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Contact not found"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

#### Delete a Contact
```http
DELETE /api/contacts/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Contact not found"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "id",
      "message": "Invalid contact ID"
    }
  ]
}
```

#### Delete All Contacts
```http
DELETE /api/contacts?confirm=DELETE_ALL
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Deleted 150 contacts successfully",
  "count": 150
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "confirm",
      "message": "Confirmation key is required. Use confirm=DELETE_ALL"
    }
  ]
}
```

### Search & Filtering

#### Get All Contacts (Paginated)
```http
GET /api/contacts?page=1&limit=50
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Alice Williams",
      "phone": "+5566778899",
      "bloodGroup": "AB-",
      "lobby": "HR",
      "designation": "Director",
      "createdAt": "2025-01-25T10:00:00.000Z",
      "updatedAt": "2025-01-25T10:00:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Bob Johnson",
      "phone": "+1122334455",
      "bloodGroup": "B+",
      "lobby": "Sales",
      "designation": "Executive",
      "createdAt": "2025-01-25T11:00:00.000Z",
      "updatedAt": "2025-01-25T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

**Response (Empty - 200 OK):**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 0,
    "totalPages": 0
  }
}
```

#### Search by Name
```http
GET /api/contacts/search/name?query=ra&page=1&limit=50
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Ravi Kumar",
      "phone": "+9988776655",
      "bloodGroup": "A+",
      "lobby": "IT",
      "designation": "Developer",
      "createdAt": "2025-01-25T09:00:00.000Z",
      "updatedAt": "2025-01-25T09:00:00.000Z"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "Sravan Reddy",
      "phone": "+8877665544",
      "bloodGroup": "O+",
      "lobby": "Operations",
      "designation": "Manager",
      "createdAt": "2025-01-25T08:00:00.000Z",
      "updatedAt": "2025-01-25T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2,
    "totalPages": 1
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "query",
      "message": "Search query is required"
    }
  ]
}
```

#### Search by Phone
```http
GET /api/contacts/search/phone?phone=1234567890
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "phone": "+1234567890",
    "bloodGroup": "O+",
    "lobby": "Engineering",
    "designation": "Senior Developer",
    "createdAt": "2025-01-25T12:00:00.000Z",
    "updatedAt": "2025-01-25T12:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Contact not found"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Phone number is required"
}
```

#### Get Total Count
```http
GET /api/contacts/count
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 150
}
```

#### Get All Blood Groups
```http
GET /api/contacts/blood-groups
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    "A+",
    "A-",
    "AB+",
    "AB-",
    "B+",
    "B-",
    "O+",
    "O-"
  ]
}
```

**Notes:**
- Returns all unique blood groups from contacts (case-insensitive)
- Blood groups are normalized to uppercase and sorted alphabetically
- Empty or null blood groups are excluded

#### Filter Contacts (Unified Filter Endpoint - Recommended)
```http
GET /api/contacts/filter?bloodGroup=A+&lobby=X&designation=Manager&page=1&limit=50
```

**Query Parameters:**
- `bloodGroup` (optional): Single blood group or comma-separated list (e.g., `A+` or `A+,B+,O+`)
- `lobby` (optional): Single lobby or comma-separated list (e.g., `Engineering` or `Engineering,Sales`)
- `designation` (optional): Single designation or comma-separated list (e.g., `Manager` or `Manager,Developer`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50, max: 100)

**Note:** At least one filter (`bloodGroup`, `lobby`, or `designation`) must be provided.

**Examples:**

**Single Filter:**
```http
GET /api/contacts/filter?bloodGroup=A+
GET /api/contacts/filter?lobby=X
GET /api/contacts/filter?designation=Manager
```

**Multiple Filters (AND logic):**
```http
GET /api/contacts/filter?bloodGroup=A+&lobby=X
GET /api/contacts/filter?bloodGroup=A+,B+&lobby=X,Y&designation=Manager
GET /api/contacts/filter?lobby=X&designation=Manager,Developer
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "phone": "+1234567890",
      "bloodGroup": "A+",
      "lobby": "Engineering",
      "designation": "Manager",
      "createdAt": "2025-01-25T12:00:00.000Z",
      "updatedAt": "2025-01-25T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "totalPages": 1
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "At least one filter (bloodGroup, lobby, or designation) is required"
}
```

**Notes:**
- All filters use AND logic: contact must match all specified filters
- Within each filter, values use OR logic (e.g., `bloodGroup=A+,B+` matches "A+" OR "B+")
- Case-insensitive matching for all filters
- Results are sorted by name

**Filter Logic Examples:**
- `bloodGroup=A+&lobby=X` → Contacts with blood group "A+" AND in lobby "X"
- `bloodGroup=A+,B+&lobby=X,Y` → Contacts with blood group "A+" OR "B+" AND in lobby "X" OR "Y"
- `lobby=X&designation=Manager,Developer` → Contacts in lobby "X" AND with designation "Manager" OR "Developer"
- `bloodGroup=A+&lobby=X&designation=Manager` → Contacts with blood group "A+" AND in lobby "X" AND with designation "Manager"

---

#### Get Contacts by Blood Group and/or Lobby (Deprecated)
```http
GET /api/contacts/by-blood-group?bloodGroup=A+&page=1&limit=50
```

**⚠️ Deprecated:** This endpoint is deprecated. Please use `GET /api/contacts/filter` instead.

**Query Parameters:**
- `bloodGroup` (optional): Single blood group or comma-separated list (e.g., `A+` or `A+,B+,O+`)
- `lobby` (optional): Single lobby or comma-separated list (e.g., `Engineering` or `Engineering,Sales`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50, max: 100)

**Note:** At least one of `bloodGroup` or `lobby` must be provided.

**Single Blood Group:**
```http
GET /api/contacts/by-blood-group?bloodGroup=A+
```

**Multiple Blood Groups:**
```http
GET /api/contacts/by-blood-group?bloodGroup=A+,B+,O+
```

**Blood Group with Lobby Filter:**
```http
GET /api/contacts/by-blood-group?bloodGroup=A+&lobby=X
```

**Multiple Blood Groups with Multiple Lobbies:**
```http
GET /api/contacts/by-blood-group?bloodGroup=A+,B+&lobby=X,Y
```

**Only Lobby (no bloodGroup):**
```http
GET /api/contacts/by-blood-group?lobby=X
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "phone": "+1234567890",
      "bloodGroup": "A+",
      "lobby": "Engineering",
      "designation": "Senior Developer",
      "createdAt": "2025-01-25T12:00:00.000Z",
      "updatedAt": "2025-01-25T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "At least one of bloodGroup or lobby is required"
}
```

**Notes:**
- Case-insensitive matching (e.g., "A+", "a+", "A+" all match)
- Supports single or multiple blood groups (comma-separated)
- Supports single or multiple lobbies (comma-separated)
- When both are provided: returns contacts matching bloodGroup AND lobby
- Results are sorted by name

**Filter Logic:**
- `bloodGroup=A+&lobby=X` → Returns contacts with blood group "A+" in lobby "X"
- `bloodGroup=A+,B+&lobby=X,Y` → Returns contacts with blood group "A+" OR "B+" in lobby "X" OR "Y"
- `bloodGroup=A+` → Returns all contacts with blood group "A+" (any lobby)
- `lobby=X` → Returns all contacts in lobby "X" (any blood group)

#### Get All Lobbies
```http
GET /api/contacts/lobbies
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    "Administration",
    "Customer Support",
    "Engineering",
    "Finance",
    "Human Resources",
    "Logistics",
    "Marketing",
    "Operations",
    "Procurement",
    "Quality Control",
    "Sales"
  ]
}
```

**Notes:**
- Returns all unique lobbies from contacts (case-insensitive)
- Lobbies are deduplicated case-insensitively and sorted alphabetically
- Empty or null lobbies are excluded
- Preserves original case of first occurrence

#### Get All Designations
```http
GET /api/contacts/designations
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    "Analyst",
    "Associate",
    "Consultant",
    "Director",
    "Executive",
    "Manager",
    "Senior Developer",
    "Software Engineer",
    "Specialist",
    "Team Lead"
  ]
}
```

**Notes:**
- Returns all unique designations from contacts (case-insensitive)
- Designations are deduplicated case-insensitively and sorted alphabetically
- Empty or null designations are excluded
- Preserves original case of first occurrence

#### Get Contacts by Lobby and/or Designation (Deprecated)
```http
GET /api/contacts/by-lobby?lobby=Engineering&page=1&limit=50
```

**⚠️ Deprecated:** This endpoint is deprecated. Please use `GET /api/contacts/filter` instead.

**Query Parameters:**
- `lobby` (optional): Single lobby or comma-separated list (e.g., `Engineering` or `Engineering,Sales,Marketing`)
- `designation` (optional): Single designation or comma-separated list (e.g., `Manager` or `Manager,Developer,Designer`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50, max: 100)

**Note:** At least one of `lobby` or `designation` must be provided.

**Single Lobby:**
```http
GET /api/contacts/by-lobby?lobby=Engineering
```

**Multiple Lobbies:**
```http
GET /api/contacts/by-lobby?lobby=Engineering,Sales,Marketing
```

**Lobby with Designation Filter:**
```http
GET /api/contacts/by-lobby?lobby=X&designation=x,y
```

**Multiple Lobbies with Multiple Designations:**
```http
GET /api/contacts/by-lobby?lobby=A,B&designation=x,z
```

**Only Designation (no lobby):**
```http
GET /api/contacts/by-lobby?designation=x,y
```

**Single Designation:**
```http
GET /api/contacts/by-lobby?designation=Manager
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "phone": "+1234567890",
      "bloodGroup": "A+",
      "lobby": "Engineering",
      "designation": "Senior Developer",
      "createdAt": "2025-01-25T12:00:00.000Z",
      "updatedAt": "2025-01-25T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "totalPages": 1
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "At least one of lobby or designation is required"
}
```

**Notes:**
- Case-insensitive matching (e.g., "Engineering", "engineering", "ENGINEERING" all match)
- Supports single or multiple lobbies (comma-separated)
- Supports single or multiple designations (comma-separated)
- When both are provided: returns contacts matching lobby AND designation
- Results are sorted by name

**Filter Logic:**
- `lobby=X&designation=x,y` → Returns contacts in lobby "X" with designation "x" OR "y"
- `lobby=A,B&designation=x,z` → Returns contacts in lobby "A" OR "B" with designation "x" OR "z"
- `lobby=C` → Returns all contacts in lobby "C" (any designation)
- `designation=x,y` → Returns all contacts with designation "x" OR "y" (any lobby)
- `designation=Manager` → Returns all contacts with designation "Manager" (any lobby)

### Analytics Endpoints

All analytics endpoints are prefixed with `/api/analytics`

#### Get Analytics Overview
```http
GET /api/analytics/overview
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalContacts": 150,
    "contactsWithBloodGroup": 135,
    "contactsWithLobby": 140,
    "contactsWithoutBloodGroup": 15,
    "contactsWithoutLobby": 10,
    "recentContacts7Days": 25,
    "recentContacts30Days": 80,
    "visitCount": 1250,
    "bloodGroupCoverage": "90.00",
    "lobbyCoverage": "93.33"
  }
}
```

#### Get Blood Group Distribution
```http
GET /api/analytics/blood-groups
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 135,
    "distribution": [
      {
        "bloodGroup": "O+",
        "count": 45,
        "percentage": "33.33"
      },
      {
        "bloodGroup": "A+",
        "count": 35,
        "percentage": "25.93"
      },
      {
        "bloodGroup": "B+",
        "count": 25,
        "percentage": "18.52"
      },
      {
        "bloodGroup": "AB+",
        "count": 15,
        "percentage": "11.11"
      },
      {
        "bloodGroup": "O-",
        "count": 8,
        "percentage": "5.93"
      },
      {
        "bloodGroup": "A-",
        "count": 4,
        "percentage": "2.96"
      },
      {
        "bloodGroup": "B-",
        "count": 2,
        "percentage": "1.48"
      },
      {
        "bloodGroup": "AB-",
        "count": 1,
        "percentage": "0.74"
      }
    ]
  }
}
```

#### Get Lobby Distribution
```http
GET /api/analytics/lobbies
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 140,
    "distribution": [
      {
        "lobby": "Engineering",
        "count": 45,
        "percentage": "32.14"
      },
      {
        "lobby": "Sales",
        "count": 30,
        "percentage": "21.43"
      },
      {
        "lobby": "Marketing",
        "count": 25,
        "percentage": "17.86"
      },
      {
        "lobby": "Human Resources",
        "count": 20,
        "percentage": "14.29"
      },
      {
        "lobby": "Finance",
        "count": 15,
        "percentage": "10.71"
      },
      {
        "lobby": "Operations",
        "count": 5,
        "percentage": "3.57"
      }
    ]
  }
}
```

#### Get Designation Distribution
```http
GET /api/analytics/designations
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 148,
    "distribution": [
      {
        "designation": "Software Engineer",
        "count": 35,
        "percentage": "23.65"
      },
      {
        "designation": "Manager",
        "count": 25,
        "percentage": "16.89"
      },
      {
        "designation": "Senior Developer",
        "count": 20,
        "percentage": "13.51"
      },
      {
        "designation": "Executive",
        "count": 18,
        "percentage": "12.16"
      },
      {
        "designation": "Analyst",
        "count": 15,
        "percentage": "10.14"
      },
      {
        "designation": "Team Lead",
        "count": 12,
        "percentage": "8.11"
      },
      {
        "designation": "Director",
        "count": 10,
        "percentage": "6.76"
      },
      {
        "designation": "Associate",
        "count": 8,
        "percentage": "5.41"
      },
      {
        "designation": "Consultant",
        "count": 5,
        "percentage": "3.38"
      }
    ]
  }
}
```

#### Get Contacts Growth Over Time
```http
GET /api/analytics/growth?days=30
```

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30, max: 365)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "30 days",
    "totalAdded": 80,
    "dailyGrowth": [
      {
        "date": "2025-01-01",
        "count": 5,
        "cumulative": 5
      },
      {
        "date": "2025-01-02",
        "count": 3,
        "cumulative": 8
      },
      {
        "date": "2025-01-03",
        "count": 0,
        "cumulative": 8
      },
      {
        "date": "2025-01-04",
        "count": 8,
        "cumulative": 16
      },
      {
        "date": "2025-01-30",
        "count": 2,
        "cumulative": 80
      }
    ]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Days must be between 1 and 365"
}
```

#### Get Recent Contacts
```http
GET /api/analytics/recent?limit=10
```

**Query Parameters:**
- `limit` (optional): Number of recent contacts to return (default: 10, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 10,
    "contacts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "phone": "+1234567890",
        "bloodGroup": "A+",
        "lobby": "Engineering",
        "designation": "Senior Developer",
        "createdAt": "2025-01-25T12:00:00.000Z"
      }
    ]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Limit must be between 1 and 100"
}
```

#### Visit Count Tracking

The visit count feature provides thread-safe tracking of total user visits to your application. It uses database atomic operations to ensure accurate counting even when multiple users access the API simultaneously.

##### Increment Visit Count (Thread-Safe)
```http
POST /api/analytics/visits
```

**Use Case:** Call this endpoint when a user visits your application/page to increment the counter.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "visitCount": 1250
  }
}
```

**Features:**
- ✅ **Thread-Safe**: Uses database atomic increment operation (`increment: 1`)
- ✅ **Concurrent Safe**: Handles multiple simultaneous requests correctly
- ✅ **Auto-Initialize**: Automatically creates the record on first visit
- ✅ **Returns Updated Count**: Returns the new count after incrementing

**Example Usage:**
```javascript
// When user visits your page/app
fetch('/api/analytics/visits', { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    console.log('Total visits:', data.data.visitCount);
  });
```

##### Get Visit Count (Without Incrementing)
```http
GET /api/analytics/visits
```

**Use Case:** Call this endpoint to display the current visit count without incrementing it (e.g., for dashboard display).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "visitCount": 1250
  }
}
```

**Features:**
- ✅ **Read-Only**: Returns count without incrementing
- ✅ **Thread-Safe**: Safe for concurrent reads
- ✅ **No Side Effects**: Perfect for displaying count in UI

**Example Usage:**
```javascript
// To display visit count without tracking
fetch('/api/analytics/visits')
  .then(res => res.json())
  .then(data => {
    document.getElementById('visitCount').textContent = data.data.visitCount;
  });
```

**Important Notes:**
- The visit count is stored in a singleton database record (ID: "singleton")
- First call to POST endpoint will create the record with count = 1
- All subsequent calls will atomically increment the count
- The count is also included in the analytics overview endpoint
- Database migration required: Run `npx prisma migrate dev --name add_visit_count` after schema update

### Bulk Operations

#### Bulk Upload CSV/Excel
```http
POST /api/contacts/bulk-upload?replaceAll=false
Content-Type: multipart/form-data

file: [CSV or Excel file (.csv, .xlsx, .xls)]
```

**Supported File Formats:**
- CSV files (`.csv`)
- Excel files (`.xlsx`, `.xls`)

**CSV Format:**
```csv
name,phone,bloodGroup,lobby,designation
John Doe,+1234567890,O+,Engineering,Senior Developer
Jane Smith,+0987654321,A-,Marketing,Manager
```

**Excel Format:**
The API accepts Excel files with the same column structure. Column names are case-insensitive and support variations:
- `Name` or `name` → name
- `Phone` or `phone` → phone (supports scientific notation like `8.98E+09`)
- `bloodgroup`, `bloodGroup`, or `blood_group` → bloodGroup
- `lobby`, `workingDivision`, `working_division`, or `division` → lobby
- `designation` → designation
- `sno` → ignored (serial number column)

**Notes:**
- Phone numbers in scientific notation (e.g., `8.98E+09`) are automatically converted to proper format
- Column names are case-insensitive and support common variations
- Extra columns (like `sno`) are automatically ignored

**Query Parameters:**
- `replaceAll=true`: Replace all existing contacts with the new upload
- `replaceAll=false` (default): Add new contacts, skip duplicates

**Response (201 Created) - Success:**
```json
{
  "success": true,
  "message": "Bulk upload completed. 3400 contacts created.",
  "created": 3400,
  "errors": [],
  "hasErrors": false
}
```

**Response (201 Created) - With Errors:**
```json
{
  "success": true,
  "message": "Bulk upload completed. 3395 contacts created.",
  "created": 3395,
  "errors": [
    {
      "row": 10,
      "error": "Invalid phone number format"
    },
    {
      "row": 25,
      "error": "Duplicate phone number in CSV: +1234567890"
    },
    {
      "row": 50,
      "error": "Name is required"
    }
  ],
  "hasErrors": true
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

**Error Response (400 Bad Request - Invalid File):**
```json
{
  "success": false,
  "message": "Only CSV files are allowed"
}
```

**Error Response (400 Bad Request - Invalid Data):**
```json
{
  "success": false,
  "message": "Invalid CSV data format"
}
```

#### Bulk Create (JSON Array)
```http
POST /api/contacts/bulk
Content-Type: application/json

[
  {
    "name": "Rahul Verma",
    "phone": "+919812345670",
    "bloodGroup": "O+",
    "lobby": "Finance",
    "designation": "Senior Accountant"
  },
  {
    "name": "Sneha Reddy",
    "phone": "+918754329011",
    "bloodGroup": "A+",
    "lobby": "Human Resources",
    "designation": "HR Executive"
  }
]
```

**Query Parameters:**
- `replaceAll=true`: Replace all existing contacts with the new upload
- `replaceAll=false` (default): Add new contacts, skip duplicates

**Response (201 Created) - Success:**
```json
{
  "success": true,
  "message": "Bulk create completed. 10 contacts created.",
  "created": 10,
  "errors": [],
  "hasErrors": false
}
```

**Response (201 Created) - With Errors:**
```json
{
  "success": true,
  "message": "Bulk create completed. 8 contacts created.",
  "created": 8,
  "errors": [
    {
      "row": 3,
      "error": "Invalid phone number format"
    },
    {
      "row": 5,
      "error": "Contact with this phone number already exists"
    }
  ],
  "hasErrors": true
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Request body must be an array of contacts"
}
```

**Error Response (400 Bad Request - Empty Array):**
```json
{
  "success": false,
  "message": "Contacts array cannot be empty"
}
```

**Error Response (400 Bad Request - Too Many Contacts):**
```json
{
  "success": false,
  "message": "Maximum 1000 contacts allowed per request"
}
```

**Notes:**
- Maximum 1000 contacts per request
- Supports the same validation as single contact creation
- Duplicate phone numbers are skipped (not replaced) unless `replaceAll=true`
- Returns detailed error information for failed records

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
  id          String   @id @default(uuid())
  name        String
  phone       String   @unique
  bloodGroup  String?
  lobby       String?
  designation String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([name])
  @@index([phone])
  @@map("contacts")
}

model VisitCount {
  id        String   @id @default("singleton")
  count     Int      @default(0)
  updatedAt DateTime @updatedAt

  @@map("visit_count")
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
- Secure error handling (no file paths or stack traces exposed in production)
- Sanitized error messages for user-friendly responses
- JSON-only error responses (no HTML error pages)

## Deployment

### Environment Variables for Production

When deploying to production, make sure to set the following environment variables:

```env
DATABASE_URL="postgresql://user:password@host:5432/contactsdb?schema=public"
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

### CORS Configuration

**⚠️ Important for Production:** You **must** set `ALLOWED_ORIGINS` to your frontend URL(s) when deploying.

The `ALLOWED_ORIGINS` environment variable controls which domains can make requests to your API:

- **Development**: `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`
- **Production**: `ALLOWED_ORIGINS=https://your-frontend-domain.com`

**Examples:**

**Single Frontend:**
```env
ALLOWED_ORIGINS=https://myapp.com
```

**Multiple Origins (with www and subdomains):**
```env
ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com,https://admin.myapp.com
```

**With Localhost for Testing:**
```env
ALLOWED_ORIGINS=https://myapp.com,http://localhost:3000
```

**⚠️ Security Warning:** If `ALLOWED_ORIGINS` is not set, the API defaults to `'*'` (allows all origins), which is **not secure** for production. Always set this variable in production.

### Deployment Steps

1. **Set environment variables** in your hosting platform (Heroku, Railway, Render, AWS, etc.)
2. **Build the application:**
   ```bash
   npm run build
   ```
3. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```
4. **Start the production server:**
   ```bash
   npm start
   ```

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

