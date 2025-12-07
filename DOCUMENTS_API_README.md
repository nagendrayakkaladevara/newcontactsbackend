# Documents API Documentation

This document provides comprehensive documentation for all document endpoints in the Contacts Management API.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Get All Documents (Paginated)](#1-get-all-documents-paginated)
- [Get All Documents (No Pagination)](#2-get-all-documents-no-pagination)
- [Get Document by ID](#3-get-document-by-id)
- [Search Documents](#4-search-documents)
- [Get Document Count](#5-get-document-count)
- [Create Document](#6-create-document)
- [Bulk Create Documents](#7-bulk-create-documents)
- [Update Document](#8-update-document)
- [Delete Document](#9-delete-document)
- [Delete All Documents](#10-delete-all-documents)
- [Error Responses](#error-responses)

---

## Authentication

All document endpoints require **BOTH** authentication methods:

1. **API Key** - Via `X-API-Key` header or `?apiKey` query parameter
2. **Basic Authentication** - Via `Authorization: Basic <base64(username:password)>` header

**Required Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

---

## Base URL

```
Development: http://localhost:3000
Production: https://your-api-domain.com
```

All document endpoints are prefixed with `/api/documents/`

---

## 1. Get All Documents (Paginated)

Retrieves all documents with pagination support. Results are ordered by creation date (newest first).

**Endpoint:** `GET /api/documents`

**Request Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Query Parameters:**
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 50, max: 100): Number of documents per page

### Response: Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Railway service rules",
      "link": "https://drive.google.com/file/d/1gWtQvFkoaLmr8eFv-sqWbtWol73Qx0pi/view?usp=sharing",
      "uploadedBy": "mipm2534",
      "createdAt": "2023-12-17T03:29:11.073Z",
      "updatedAt": "2023-12-17T03:29:11.073Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Prolong failure of Automatic Signals",
      "link": "https://drive.google.com/file/d/1ikaXEMGi63o-B_Ft4-YROaw_lflw7MSu/view?usp=sharing",
      "uploadedBy": "mipm2534",
      "createdAt": "2023-12-17T03:35:59.587Z",
      "updatedAt": "2023-12-17T03:35:59.587Z"
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

### Response: Empty Result (200 OK)

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

### Response: Invalid Query Parameters (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "limit",
      "message": "Limit must be between 1 and 100"
    }
  ]
}
```

---

## 2. Get All Documents (No Pagination)

Retrieves all documents without pagination. Results are ordered by creation date (newest first).

**Endpoint:** `GET /api/documents/all`

**Request Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

### Response: Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Railway service rules",
      "link": "https://drive.google.com/file/d/1gWtQvFkoaLmr8eFv-sqWbtWol73Qx0pi/view?usp=sharing",
      "uploadedBy": "mipm2534",
      "createdAt": "2023-12-17T03:29:11.073Z",
      "updatedAt": "2023-12-17T03:29:11.073Z"
    }
    // ... all documents
  ],
  "count": 150
}
```

---

## 3. Get Document by ID

Retrieves a single document by its ID.

**Endpoint:** `GET /api/documents/:id`

**URL Parameters:**
- `id` (string, required): Document UUID

**Request Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

### Response: Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Railway service rules",
    "link": "https://drive.google.com/file/d/1gWtQvFkoaLmr8eFv-sqWbtWol73Qx0pi/view?usp=sharing",
    "uploadedBy": "mipm2534",
    "createdAt": "2023-12-17T03:29:11.073Z",
    "updatedAt": "2023-12-17T03:29:11.073Z"
  }
}
```

### Response: Document Not Found (404 Not Found)

```json
{
  "success": false,
  "message": "Document not found"
}
```

### Response: Invalid ID Format (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "id",
      "message": "Invalid document ID"
    }
  ]
}
```

---

## 4. Search Documents

Searches documents by title (case-insensitive, partial match).

**Endpoint:** `GET /api/documents/search`

**Request Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Query Parameters:**
- `query` (string, required): Search term
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 50, max: 100): Number of results per page

### Response: Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Railway service rules",
      "link": "https://drive.google.com/file/d/1gWtQvFkoaLmr8eFv-sqWbtWol73Qx0pi/view?usp=sharing",
      "uploadedBy": "mipm2534",
      "createdAt": "2023-12-17T03:29:11.073Z",
      "updatedAt": "2023-12-17T03:29:11.073Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

### Response: Missing Query Parameter (400 Bad Request)

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

---

## 5. Get Document Count

Returns the total number of documents in the database.

**Endpoint:** `GET /api/documents/count`

**Request Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

### Response: Success (200 OK)

```json
{
  "success": true,
  "count": 150
}
```

---

## 6. Create Document

Creates a new document.

**Endpoint:** `POST /api/documents/admin/createDocument`

**Request Headers:**
```
Content-Type: application/json
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Request Body:**
```json
{
  "title": "Railway service rules",
  "link": "https://drive.google.com/file/d/1gWtQvFkoaLmr8eFv-sqWbtWol73Qx0pi/view?usp=sharing",
  "uploadedBy": "mipm2534"
}
```

**Field Requirements:**
- `title` (string, required): Document title, 1-500 characters
- `link` (string, required): Valid URL to the document (e.g., Google Drive link)
- `uploadedBy` (string, optional): Username of the person who uploaded the document

### Response: Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Railway service rules",
    "link": "https://drive.google.com/file/d/1gWtQvFkoaLmr8eFv-sqWbtWol73Qx0pi/view?usp=sharing",
    "uploadedBy": "mipm2534",
    "createdAt": "2023-12-17T03:29:11.073Z",
    "updatedAt": "2023-12-17T03:29:11.073Z"
  }
}
```

### Response: Validation Error (400 Bad Request)

**Missing Title:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Document title is required"
    }
  ]
}
```

**Invalid Link URL:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "link",
      "message": "Invalid document link URL"
    }
  ]
}
```

---

## 7. Bulk Create Documents

Creates multiple documents from a JSON array. Maximum 1000 documents per request.

**Endpoint:** `POST /api/documents/admin/bulk`

**Request Headers:**
```
Content-Type: application/json
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Query Parameters:**
- `replaceAll` (boolean, optional): 
  - `true`: Delete all existing documents before creating
  - `false` (default): Add new documents

**Request Body:**
```json
[
  {
    "title": "Railway service rules",
    "link": "https://drive.google.com/file/d/1gWtQvFkoaLmr8eFv-sqWbtWol73Qx0pi/view?usp=sharing",
    "uploadedBy": "mipm2534"
  },
  {
    "title": "Prolong failure of Automatic Signals",
    "link": "https://drive.google.com/file/d/1ikaXEMGi63o-B_Ft4-YROaw_lflw7MSu/view?usp=sharing",
    "uploadedBy": "mipm2534"
  }
]
```

### Response: Success (201 Created)

```json
{
  "success": true,
  "message": "Bulk create completed. 100 documents created.",
  "created": 100,
  "errors": [],
  "hasErrors": false,
  "report": {
    "total": 100,
    "created": 100,
    "failed": 0,
    "errorsByType": {},
    "errorsByField": {}
  }
}
```

### Response: Success with Errors (201 Created)

```json
{
  "success": true,
  "message": "Bulk create completed. 95 documents created.",
  "created": 95,
  "errors": [
    {
      "row": 10,
      "error": "link: Invalid format",
      "type": "invalid_string",
      "field": "link"
    },
    {
      "row": 25,
      "error": "title: Value is required",
      "type": "too_small",
      "field": "title"
    }
  ],
  "hasErrors": true,
  "report": {
    "total": 100,
    "created": 95,
    "failed": 5,
    "errorsByType": {
      "invalid_string": 3,
      "too_small": 2
    },
    "errorsByField": {
      "link": 3,
      "title": 2
    }
  }
}
```

### Response: Missing Request Body (400 Bad Request)

```json
{
  "success": false,
  "message": "Request body is required"
}
```

### Response: Invalid Format (400 Bad Request)

```json
{
  "success": false,
  "message": "Request body must be an array of documents"
}
```

### Response: Empty Array (400 Bad Request)

```json
{
  "success": false,
  "message": "Documents array cannot be empty"
}
```

### Response: Too Many Documents (400 Bad Request)

```json
{
  "success": false,
  "message": "Maximum 1000 documents allowed per request"
}
```

### Response: Rate Limit Exceeded (429 Too Many Requests)

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

**Error Report Structure:**
- `total`: Total documents in the request
- `created`: Successfully created documents
- `failed`: Documents that failed validation
- `errorsByType`: Count of errors grouped by error type
- `errorsByField`: Count of errors grouped by field

---

## 8. Update Document

Updates an existing document. All fields are optional - only provided fields will be updated.

**Endpoint:** `PUT /api/documents/admin/updateDocument/:id`

**URL Parameters:**
- `id` (string, required): Document UUID

**Request Headers:**
```
Content-Type: application/json
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Request Body (All fields optional):**
```json
{
  "title": "Updated Railway service rules",
  "link": "https://drive.google.com/file/d/1gWtQvFkoaLmr8eFv-sqWbtWol73Qx0pi/view?usp=sharing",
  "uploadedBy": "admin"
}
```

### Response: Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Railway service rules",
    "link": "https://drive.google.com/file/d/1gWtQvFkoaLmr8eFv-sqWbtWol73Qx0pi/view?usp=sharing",
    "uploadedBy": "admin",
    "createdAt": "2023-12-17T03:29:11.073Z",
    "updatedAt": "2023-12-17T03:35:00.000Z"
  }
}
```

### Response: Document Not Found (404 Not Found)

```json
{
  "success": false,
  "message": "Document not found"
}
```

### Response: Validation Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "link",
      "message": "Invalid document link URL"
    }
  ]
}
```

---

## 9. Delete Document

Deletes a single document by ID. This operation is irreversible.

**Endpoint:** `DELETE /api/documents/admin/deleteDocument/:id`

**URL Parameters:**
- `id` (string, required): Document UUID

**Request Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

### Response: Success (200 OK)

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Response: Document Not Found (404 Not Found)

```json
{
  "success": false,
  "message": "Document not found"
}
```

### Response: Invalid ID Format (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "id",
      "message": "Invalid document ID"
    }
  ]
}
```

---

## 10. Delete All Documents

Deletes all documents from the database. This is a destructive operation that requires explicit confirmation.

**Endpoint:** `DELETE /api/documents/admin/deleteAllDocuments`

**Request Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Query Parameters:**
- `confirm` (string, required): Must be exactly `DELETE_ALL` (case-sensitive)

### Response: Success (200 OK)

```json
{
  "success": true,
  "message": "Deleted 150 documents successfully",
  "count": 150
}
```

### Response: Missing Confirmation (400 Bad Request)

```json
{
  "success": false,
  "message": "Confirmation required. Use ?confirm=DELETE_ALL"
}
```

**⚠️ Critical Warning:**
- This operation permanently deletes ALL documents from the database
- This action cannot be undone
- Use with extreme caution
- Recommended: Backup database before executing

---

## Error Responses

All endpoints follow a consistent error response format.

### Standard Error Response Structure

```json
{
  "success": false,
  "message": "Error message description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, DELETE operations
- `201 Created`: Successful POST operations (create)
- `400 Bad Request`: Validation errors, invalid input
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side errors

### Common Error Scenarios

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Document title is required"
    },
    {
      "field": "link",
      "message": "Invalid document link URL"
    }
  ]
}
```

#### Resource Not Found (404)
```json
{
  "success": false,
  "message": "Document not found"
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "message": "API key required. Please provide API key via X-API-Key header or ?apiKey query parameter."
}
```

---

## Database Migration

After adding the Document model to the Prisma schema, you need to create and run a migration:

```bash
# Generate migration
npx prisma migrate dev --name add_documents

# Or if you want to create the migration without applying it
npx prisma migrate dev --create-only --name add_documents
```

This will create the `documents` table in your PostgreSQL database.

---

## Example Usage

### Create a Document
```
POST /api/documents/admin/createDocument
Headers:
  X-API-Key: your-api-key
  Authorization: Basic base64(username:password)
Body:
{
  "title": "Railway service rules",
  "link": "https://drive.google.com/file/d/1gWtQvFkoaLmr8eFv-sqWbtWol73Qx0pi/view?usp=sharing",
  "uploadedBy": "mipm2534"
}
```

### Get All Documents
```
GET /api/documents?page=1&limit=50
Headers:
  X-API-Key: your-api-key
  Authorization: Basic base64(username:password)
```

### Search Documents
```
GET /api/documents/search?query=railway&page=1&limit=50
Headers:
  X-API-Key: your-api-key
  Authorization: Basic base64(username:password)
```

### Update a Document
```
PUT /api/documents/admin/updateDocument/550e8400-e29b-41d4-a716-446655440000
Headers:
  X-API-Key: your-api-key
  Authorization: Basic base64(username:password)
Body:
{
  "title": "Updated Railway service rules"
}
```

### Delete a Document
```
DELETE /api/documents/admin/deleteDocument/550e8400-e29b-41d4-a716-446655440000
Headers:
  X-API-Key: your-api-key
  Authorization: Basic base64(username:password)
```

---

## Version Information

- **API Version:** 1.1.0
- **Last Updated:** 2025-01-25
- **Documentation Version:** 1.0.0

---

## Related Documentation

- `API_KEY_AUTH_GUIDE.md` - Complete authentication guide
- `POSTMAN_AUTH_SETUP.md` - Postman setup instructions
- `ADMIN_ENDPOINTS_README.md` - Admin endpoints documentation

