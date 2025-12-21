# Contacts API Reference

Complete reference for all contact management endpoints.

## Base URL

```
/api/contacts
```

All endpoints require authentication. See [Security Documentation](../security.md) for authentication details.

## Endpoints

### List Contacts (Paginated)

Get all contacts with pagination.

**Endpoint**: `GET /api/contacts`

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50, max: 100)

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/contacts?page=1&limit=50"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "1234567890",
      "bloodGroup": "A+",
      "lobby": "Engineering",
      "designation": "Manager",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

---

### List All Contacts (No Pagination)

Get all contacts without pagination.

**Endpoint**: `GET /api/contacts/all`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/contacts/all"
```

**Example Response**:
```json
{
  "success": true,
  "data": [...],
  "count": 100
}
```

---

### Get Contact Count

Get total number of contacts.

**Endpoint**: `GET /api/contacts/count`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/contacts/count"
```

**Example Response**:
```json
{
  "success": true,
  "count": 100
}
```

---

### Search by Name

Search contacts by name (partial match, case-insensitive).

**Endpoint**: `GET /api/contacts/search/name`

**Query Parameters**:
- `query` (string, required): Search query
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50, max: 100)

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/contacts/search/name?query=john&page=1&limit=50"
```

**Example Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### Search by Phone

Search contacts by phone number (partial match, user-friendly like mobile contact search).

**Endpoint**: `GET /api/contacts/search/phone`

**Query Parameters**:
- `query` (string, required): Phone number or partial phone number

**Features**:
- Partial matching (e.g., "414" matches "9298363414")
- Phone number normalization (handles spaces, dashes, parentheses)
- Returns all matching contacts

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/contacts/search/phone?query=414"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "9298363414",
      ...
    }
  ],
  "count": 1
}
```

---

### Filter Contacts

Filter contacts by blood group, lobby, and/or designation.

**Endpoint**: `GET /api/contacts/filter`

**Query Parameters**:
- `bloodGroup` (string, optional): Comma-separated blood groups (e.g., "A+,B+,O+")
- `lobby` (string, optional): Comma-separated lobbies (e.g., "Engineering,Sales")
- `designation` (string, optional): Comma-separated designations (e.g., "Manager,Director")
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50, max: 100)

**Note**: At least one filter (bloodGroup, lobby, or designation) must be provided.

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/contacts/filter?bloodGroup=A+&lobby=Engineering&page=1&limit=50"
```

**Example Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10,
    "totalPages": 1
  }
}
```

---

### Get Blood Groups

Get all unique blood groups.

**Endpoint**: `GET /api/contacts/blood-groups`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/contacts/blood-groups"
```

**Example Response**:
```json
{
  "success": true,
  "data": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
}
```

---

### Get Lobbies

Get all unique lobbies.

**Endpoint**: `GET /api/contacts/lobbies`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/contacts/lobbies"
```

**Example Response**:
```json
{
  "success": true,
  "data": ["Engineering", "Sales", "Marketing"]
}
```

---

### Get Designations

Get all unique designations.

**Endpoint**: `GET /api/contacts/designations`

**Example Request**:
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/api/contacts/designations"
```

**Example Response**:
```json
{
  "success": true,
  "data": ["Manager", "Director", "Engineer"]
}
```

---

## Admin Endpoints

### Create Contact

Create a new contact.

**Endpoint**: `POST /api/contacts/admin/createContact`

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token (get from `/api/csrf-token`)
- `Content-Type`: application/json

**Request Body**:
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "bloodGroup": "A+",
  "lobby": "Engineering",
  "designation": "Manager"
}
```

**Field Validation**:
- `name` (string, required): 1-255 characters
- `phone` (string, required): 10-15 digits, unique
- `bloodGroup` (string, optional): Max 10 characters
- `lobby` (string, optional): Max 255 characters
- `designation` (string, optional): Max 255 characters

**Example Request**:
```bash
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "1234567890",
    "bloodGroup": "A+",
    "lobby": "Engineering",
    "designation": "Manager"
  }' \
  "http://localhost:3000/api/contacts/admin/createContact"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "1234567890",
    "bloodGroup": "A+",
    "lobby": "Engineering",
    "designation": "Manager",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Validation error
- `409`: Duplicate phone number

---

### Update Contact

Update an existing contact.

**Endpoint**: `PUT /api/contacts/admin/updateContact/:id`

**Path Parameters**:
- `id` (string, required): Contact UUID

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token
- `Content-Type`: application/json

**Request Body** (all fields optional):
```json
{
  "name": "Jane Doe",
  "bloodGroup": "B+",
  "lobby": "Sales"
}
```

**Example Request**:
```bash
curl -X PUT \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe"}' \
  "http://localhost:3000/api/contacts/admin/updateContact/uuid"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Doe",
    ...
  }
}
```

**Error Responses**:
- `400`: Validation error
- `404`: Contact not found

---

### Delete Contact

Delete a contact.

**Endpoint**: `DELETE /api/contacts/admin/deleteContact/:id`

**Path Parameters**:
- `id` (string, required): Contact UUID

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token

**Example Request**:
```bash
curl -X DELETE \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  "http://localhost:3000/api/contacts/admin/deleteContact/uuid"
```

**Example Response**:
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

**Error Responses**:
- `404`: Contact not found

---

### Bulk Upload (CSV)

Upload contacts via CSV file.

**Endpoint**: `POST /api/contacts/admin/bulk-upload`

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token
- `Content-Type`: multipart/form-data

**Query Parameters**:
- `replaceAll` (boolean, optional): Replace all existing contacts (default: false)

**Request Body**:
- `file` (file, required): CSV file

**CSV Format**:
```csv
name,phone,bloodGroup,lobby,designation
John Doe,1234567890,A+,Engineering,Manager
Jane Smith,0987654321,B+,Sales,Director
```

**Example Request**:
```bash
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  -F "file=@contacts.csv" \
  "http://localhost:3000/api/contacts/admin/bulk-upload?replaceAll=false"
```

**Example Response**:
```json
{
  "success": true,
  "message": "Bulk upload completed. 100 contacts created.",
  "created": 100,
  "errors": [],
  "hasErrors": false
}
```

**Error Response** (with errors):
```json
{
  "success": true,
  "message": "Bulk upload completed. 95 contacts created.",
  "created": 95,
  "errors": [
    {
      "row": 5,
      "field": "phone",
      "message": "Invalid phone number format"
    }
  ],
  "hasErrors": true
}
```

**Rate Limit**: 10 requests per minute per IP

---

### Bulk Create (JSON)

Create multiple contacts via JSON array.

**Endpoint**: `POST /api/contacts/admin/bulk`

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token
- `Content-Type`: application/json

**Query Parameters**:
- `replaceAll` (boolean, optional): Replace all existing contacts (default: false)

**Request Body**:
```json
[
  {
    "name": "John Doe",
    "phone": "1234567890",
    "bloodGroup": "A+",
    "lobby": "Engineering",
    "designation": "Manager"
  },
  {
    "name": "Jane Smith",
    "phone": "0987654321",
    "bloodGroup": "B+",
    "lobby": "Sales",
    "designation": "Director"
  }
]
```

**Limits**:
- Maximum 1000 contacts per request

**Example Request**:
```bash
curl -X POST \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  -H "Content-Type: application/json" \
  -d @contacts.json \
  "http://localhost:3000/api/contacts/admin/bulk"
```

**Example Response**:
```json
{
  "success": true,
  "message": "Bulk create completed. 100 contacts created.",
  "created": 100,
  "errors": [],
  "hasErrors": false
}
```

**Rate Limit**: 10 requests per minute per IP

---

### Delete All Contacts

Delete all contacts (use with caution).

**Endpoint**: `DELETE /api/contacts/admin/deleteAllContacts`

**Query Parameters**:
- `confirm` (string, required): Must be "DELETE_ALL"

**Headers**:
- `X-API-Key`: Your API key
- `X-CSRF-Token`: CSRF token

**Example Request**:
```bash
curl -X DELETE \
  -H "X-API-Key: your-api-key" \
  -H "X-CSRF-Token: csrf-token" \
  "http://localhost:3000/api/contacts/admin/deleteAllContacts?confirm=DELETE_ALL"
```

**Example Response**:
```json
{
  "success": true,
  "message": "Deleted 100 contacts successfully",
  "count": 100
}
```

**Rate Limit**: 5 requests per minute per IP

---

## Deprecated Endpoints

The following endpoints are deprecated. Use `/api/contacts/filter` instead.

### Get Contacts by Blood Group

**Endpoint**: `GET /api/contacts/by-blood-group`

**Status**: Deprecated - Use `/api/contacts/filter` instead

### Get Contacts by Lobby

**Endpoint**: `GET /api/contacts/by-lobby`

**Status**: Deprecated - Use `/api/contacts/filter` instead

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
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

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Invalid CSRF token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Contact not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Contact with this phone number already exists"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "requestId": "req-123456"
}
```

