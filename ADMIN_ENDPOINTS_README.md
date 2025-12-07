# Admin Endpoints Documentation

This document provides comprehensive documentation for all admin endpoints in the Contacts Management API. Admin endpoints require authentication (API Key + Basic Auth) and are used for creating, updating, and deleting contacts.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Get All Contacts](#0-get-all-contacts)
- [Create Contact](#1-create-contact)
- [Update Contact](#2-update-contact)
- [Delete Contact](#3-delete-contact)
- [Bulk Upload (CSV/Excel)](#4-bulk-upload-csvexcel)
- [Bulk Create (JSON)](#5-bulk-create-json)
- [Delete All Contacts](#6-delete-all-contacts)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)

---

## Authentication

All admin endpoints require **BOTH** authentication methods:

1. **API Key** - Via `X-API-Key` header or `?apiKey` query parameter
2. **Basic Authentication** - Via `Authorization: Basic <base64(username:password)>` header

**Required Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

For detailed authentication setup, see:
- `API_KEY_AUTH_GUIDE.md` - Complete authentication guide
- `POSTMAN_AUTH_SETUP.md` - Postman setup instructions

---

## Base URL

```
Development: http://localhost:3000
Production: https://your-api-domain.com
```

**Admin Endpoint Prefixes:**
- Create, Update, Delete operations: `/api/contacts/admin/`
- Read operations (Get All Contacts): `/api/contacts/`

---

## 0. Get All Contacts

Retrieves all contacts with pagination support. Results are ordered by name in ascending order.

**Endpoint:** `GET /api/contacts`

**Request Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Query Parameters:**
- `page` (number, optional, default: 1): Page number (must be positive integer)
- `limit` (number, optional, default: 50, max: 100): Number of contacts per page

**Example Requests:**
```
GET /api/contacts
GET /api/contacts?page=1&limit=50
GET /api/contacts?page=2&limit=100
```

### Response: Success (200 OK)

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
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Jane Smith",
      "phone": "+0987654321",
      "bloodGroup": "B+",
      "lobby": "Marketing",
      "designation": "Manager",
      "createdAt": "2025-01-25T12:05:00.000Z",
      "updatedAt": "2025-01-25T12:05:00.000Z"
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

When no contacts exist:

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

**Invalid Page Number:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "page",
      "message": "Page must be a positive number"
    }
  ]
}
```

**Invalid Limit (Exceeds Maximum):**
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

### Response: Authentication Error (401 Unauthorized)

Same as Create Contact endpoint.

**Notes:**
- Results are ordered by name in ascending order
- Maximum `limit` is 100
- Returns paginated results
- Requires authentication

---

## 1. Create Contact

Creates a new contact in the database.

**Endpoint:** `POST /api/contacts/admin/createContact`

**Request Headers:**
```
Content-Type: application/json
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "bloodGroup": "A+",
  "lobby": "Engineering",
  "designation": "Senior Developer"
}
```

**Field Requirements:**
- `name` (string, required): Contact name, 1-255 characters
- `phone` (string, required): Phone number, 1-15 digits, supports formats like `+1234567890`, `1234567890`
- `bloodGroup` (string, optional): Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `lobby` (string, optional): Department/division name, max 255 characters
- `designation` (string, optional): Job title/position, max 255 characters

### Response: Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "phone": "+1234567890",
    "bloodGroup": "A+",
    "lobby": "Engineering",
    "designation": "Senior Developer",
    "createdAt": "2025-01-25T12:00:00.000Z",
    "updatedAt": "2025-01-25T12:00:00.000Z"
  }
}
```

### Response: Validation Error (400 Bad Request)

**Missing Required Field:**
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

**Invalid Phone Format:**
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

**Multiple Validation Errors:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Name is too long"
    },
    {
      "field": "phone",
      "message": "Phone number is too long"
    }
  ]
}
```

### Response: Duplicate Phone (409 Conflict)

```json
{
  "success": false,
  "message": "Contact with this phone number already exists"
}
```

### Response: Authentication Error (401 Unauthorized)

**Missing API Key:**
```json
{
  "success": false,
  "message": "API key required. Please provide API key via X-API-Key header or ?apiKey query parameter."
}
```

**Missing Basic Auth:**
```json
{
  "success": false,
  "message": "Basic authentication required. Please provide credentials in Authorization header (Basic base64(username:password))."
}
```

**Invalid API Key:**
```json
{
  "success": false,
  "message": "Invalid API key."
}
```

**Invalid Basic Auth:**
```json
{
  "success": false,
  "message": "Invalid authentication credentials"
}
```

---

## 2. Update Contact

Updates an existing contact by ID. All fields are optional - only provided fields will be updated.

**Endpoint:** `PUT /api/contacts/admin/updateContact/:id`

**URL Parameters:**
- `id` (string, required): Contact UUID

**Request Headers:**
```
Content-Type: application/json
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Request Body (All fields optional):**
```json
{
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "bloodGroup": "A+",
  "lobby": "Marketing",
  "designation": "Marketing Manager"
}
```

### Response: Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe Updated",
    "phone": "+1234567890",
    "bloodGroup": "A+",
    "lobby": "Marketing",
    "designation": "Marketing Manager",
    "createdAt": "2025-01-25T12:00:00.000Z",
    "updatedAt": "2025-01-25T12:05:00.000Z"
  }
}
```

### Response: Contact Not Found (404 Not Found)

```json
{
  "success": false,
  "message": "Contact not found"
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
      "message": "Invalid contact ID"
    }
  ]
}
```

### Response: Duplicate Phone (409 Conflict)

When updating phone number to one that already exists:

```json
{
  "success": false,
  "message": "Contact with this phone number already exists"
}
```

### Response: Validation Error (400 Bad Request)

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

### Response: Authentication Error (401 Unauthorized)

Same as Create Contact endpoint.

---

## 3. Delete Contact

Deletes a single contact by ID. This operation is irreversible.

**Endpoint:** `DELETE /api/contacts/admin/deleteContact/:id`

**URL Parameters:**
- `id` (string, required): Contact UUID

**Request Headers:**
```
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

### Response: Success (200 OK)

```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

### Response: Contact Not Found (404 Not Found)

```json
{
  "success": false,
  "message": "Contact not found"
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
      "message": "Invalid contact ID"
    }
  ]
}
```

### Response: Authentication Error (401 Unauthorized)

Same as Create Contact endpoint.

---

## 4. Bulk Upload (CSV/Excel)

Uploads and imports multiple contacts from a CSV or Excel file.

**Endpoint:** `POST /api/contacts/admin/bulk-upload`

**Request Headers:**
```
Content-Type: multipart/form-data
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Query Parameters:**
- `replaceAll` (boolean, optional): 
  - `true`: Delete all existing contacts before uploading
  - `false` (default): Add/update contacts (uses upsert)

**Request Body:**
- `file` (file, required): CSV or Excel file (.csv, .xlsx, .xls)

**Supported File Formats:**
- CSV files (`.csv`)
- Excel files (`.xlsx`, `.xls`)

**File Format:**
```csv
name,phone,bloodGroup,lobby,designation
John Doe,+1234567890,O+,Engineering,Senior Developer
Jane Smith,+0987654321,A-,Marketing,Manager
```

**Column Requirements:**
- `name` (required): Contact name
- `phone` (required): Phone number, 1-15 digits
- `bloodGroup` (optional): Blood group
- `lobby` (optional): Department/division
- `designation` (optional): Job title

### Response: Success (201 Created)

```json
{
  "success": true,
  "message": "Bulk upload completed. 3400 contacts created.",
  "created": 3400,
  "errors": [],
  "hasErrors": false,
  "partialUpload": false,
  "connectionLost": false,
  "report": {
    "total": 3400,
    "created": 3400,
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
  "message": "Bulk upload completed. 3395 contacts created.",
  "created": 3395,
  "errors": [
    {
      "row": 10,
      "error": "phone: Invalid format",
      "type": "invalid_string",
      "field": "phone"
    },
    {
      "row": 25,
      "error": "Duplicate phone number in CSV: +1234567890",
      "type": "duplicate",
      "field": "phone"
    },
    {
      "row": 50,
      "error": "name: Value is required",
      "type": "too_small",
      "field": "name"
    }
  ],
  "hasErrors": true,
  "partialUpload": false,
  "connectionLost": false,
  "report": {
    "total": 3400,
    "created": 3395,
    "failed": 5,
    "errorsByType": {
      "invalid_string": 2,
      "duplicate": 2,
      "too_small": 1
    },
    "errorsByField": {
      "phone": 4,
      "name": 1
    }
  }
}
```

### Response: Connection Lost (206 Partial Content)

When connection is lost during upload:

```json
{
  "success": false,
  "message": "Connection lost during upload. 1500 contacts uploaded successfully. 1700 contacts were not processed. You can safely retry the upload - already uploaded contacts will be updated, not duplicated.",
  "created": 1500,
  "hasErrors": true,
  "partialUpload": true,
  "connectionLost": true,
  "errors": [
    {
      "row": -1,
      "error": "Connection lost during upload. 1500 contacts uploaded successfully. 1700 contacts were not processed.",
      "type": "connection_error"
    }
  ],
  "report": {
    "total": 3200,
    "created": 1500,
    "failed": 1700,
    "errorsByType": {
      "connection_error": 1700
    },
    "errorsByField": {},
    "connectionLost": true,
    "partialUpload": true,
    "processedContacts": 1500,
    "notProcessedContacts": 1700,
    "message": "Connection lost during upload. 1500 contacts uploaded successfully. 1700 contacts were not processed. You can safely retry the upload - already uploaded contacts will be updated, not duplicated."
  }
}
```

### Response: No File Uploaded (400 Bad Request)

```json
{
  "success": false,
  "message": "No file uploaded"
}
```

### Response: Invalid File Format (400 Bad Request)

```json
{
  "success": false,
  "message": "Only CSV and Excel files (.csv, .xlsx, .xls) are allowed"
}
```

### Response: Invalid CSV Data Format (400 Bad Request)

```json
{
  "success": false,
  "message": "Invalid CSV data format"
}
```

### Response: Rate Limit Exceeded (429 Too Many Requests)

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

### Response: Authentication Error (401 Unauthorized)

Same as Create Contact endpoint.

**Error Report Structure:**
- `total`: Total contacts in the file
- `created`: Successfully created contacts
- `failed`: Contacts that failed validation or processing
- `errorsByType`: Count of errors grouped by error type
- `errorsByField`: Count of errors grouped by field
- `connectionLost`: Boolean indicating if connection was lost
- `partialUpload`: Boolean indicating if upload was partially completed
- `processedContacts`: Number of contacts processed before connection loss
- `notProcessedContacts`: Number of contacts not processed due to connection loss

**Error Types:**
- `duplicate`: Duplicate phone number in CSV
- `invalid_string`: Invalid phone number format
- `too_small`: Missing required field or value too short
- `too_big`: Value too long
- `invalid_type`: Invalid value type
- `connection_error`: Connection lost during upload

---

## 5. Bulk Create (JSON)

Creates multiple contacts from a JSON array. Maximum 1000 contacts per request.

**Endpoint:** `POST /api/contacts/admin/bulk`

**Request Headers:**
```
Content-Type: application/json
X-API-Key: <your-api-key>
Authorization: Basic <base64(username:password)>
```

**Query Parameters:**
- `replaceAll` (boolean, optional): 
  - `true`: Delete all existing contacts before creating
  - `false` (default): Add/update contacts (uses upsert)

**Request Body:**
```json
[
  {
    "name": "John Doe",
    "phone": "+1234567890",
    "bloodGroup": "A+",
    "lobby": "Engineering",
    "designation": "Senior Developer"
  },
  {
    "name": "Jane Smith",
    "phone": "+0987654321",
    "bloodGroup": "B+",
    "lobby": "Marketing",
    "designation": "Manager"
  }
]
```

### Response: Success (201 Created)

```json
{
  "success": true,
  "message": "Bulk create completed. 100 contacts created.",
  "created": 100,
  "errors": [],
  "hasErrors": false
}
```

### Response: Success with Errors (201 Created)

```json
{
  "success": true,
  "message": "Bulk create completed. 95 contacts created.",
  "created": 95,
  "errors": [
    {
      "row": 10,
      "error": "phone: Invalid format",
      "type": "invalid_string",
      "field": "phone"
    },
    {
      "row": 25,
      "error": "Duplicate phone number in CSV: +1234567890",
      "type": "duplicate",
      "field": "phone"
    }
  ],
  "hasErrors": true
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
  "message": "Request body must be an array of contacts"
}
```

### Response: Empty Array (400 Bad Request)

```json
{
  "success": false,
  "message": "Contacts array cannot be empty"
}
```

### Response: Too Many Contacts (400 Bad Request)

```json
{
  "success": false,
  "message": "Maximum 1000 contacts allowed per request"
}
```

### Response: Rate Limit Exceeded (429 Too Many Requests)

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

### Response: Authentication Error (401 Unauthorized)

Same as Create Contact endpoint.

---

## 6. Delete All Contacts

Deletes all contacts from the database. This is a destructive operation that requires explicit confirmation.

**Endpoint:** `DELETE /api/contacts/admin/deleteAllContacts`

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
  "message": "Deleted 150 contacts successfully",
  "count": 150
}
```

### Response: Missing Confirmation (400 Bad Request)

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

### Response: Invalid Confirmation (400 Bad Request)

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

### Response: Rate Limit Exceeded (429 Too Many Requests)

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

### Response: Authentication Error (401 Unauthorized)

Same as Create Contact endpoint.

**⚠️ Critical Warning:**
- This operation permanently deletes ALL contacts from the database
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
- `206 Partial Content`: Partial success (connection lost during bulk upload)
- `400 Bad Request`: Validation errors, invalid input
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (e.g., phone number already exists)
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
      "field": "phone",
      "message": "Invalid phone number format"
    },
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

#### Resource Not Found (404)
```json
{
  "success": false,
  "message": "Contact not found"
}
```

#### Conflict Error (409)
```json
{
  "success": false,
  "message": "Contact with this phone number already exists"
}
```

#### Database Error (503)
```json
{
  "success": false,
  "message": "Database service temporarily unavailable"
}
```

---

## Rate Limiting

Admin endpoints have rate limiting applied:

- **Bulk Operations** (`/admin/bulk-upload`, `/admin/bulk`): 
  - 10 requests per minute per IP
- **Delete All Contacts** (`/admin/` with DELETE):
  - 1 request per minute per IP
- **Other Admin Endpoints**:
  - Standard rate limiting applies

### Rate Limit Exceeded Response (429)

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## Best Practices

### 1. Authentication
- Always include both API Key and Basic Auth headers
- Store credentials securely (environment variables)
- Never commit credentials to version control
- Rotate credentials periodically

### 2. Bulk Operations
- For large datasets (>1000 records), use CSV/Excel bulk upload
- Always check the `hasErrors` flag in bulk operation responses
- Review error details to identify and fix data quality issues
- If connection is lost (206 status), simply retry the upload
- Test with a small sample file first

### 3. Error Handling
- Always check the `success` field in API responses
- Handle validation errors gracefully
- Display user-friendly error messages
- Log errors for debugging purposes
- Handle network errors and timeouts

### 4. Data Validation
- Validate input data before sending requests
- Ensure phone numbers are in correct format (1-15 digits)
- Check required fields are present
- Verify data types match expected formats

### 5. Security
- Use HTTPS in production
- Never expose API keys in client-side code
- Implement proper CORS policies
- Monitor for suspicious activity
- Keep dependencies updated

---

## Support & Troubleshooting

### Common Issues

1. **Authentication errors (401)**
   - Verify both API Key and Basic Auth are included
   - Check credentials match `.env` file values
   - Ensure headers are properly formatted

2. **Validation errors (400)**
   - Check required fields are present
   - Verify phone number format (1-15 digits)
   - Ensure data types are correct

3. **Duplicate phone errors (409)**
   - Phone numbers must be unique
   - Check if contact already exists before creating
   - Use update endpoint if contact exists

4. **Bulk upload errors**
   - Review `errors` array for specific issues
   - Check `report.errorsByType` for error categories
   - Verify file format matches requirements
   - Ensure file is properly encoded (UTF-8)

5. **Connection loss during upload (206)**
   - Check `report.processedContacts` for uploaded count
   - Simply retry the upload - it's safe and idempotent
   - Already uploaded contacts will be updated, not duplicated

### Getting Help

- Check `API_KEY_AUTH_GUIDE.md` for authentication setup
- Review `CONNECTION_LOSS_HANDLING.md` for bulk upload issues
- Check server logs for detailed error information
- Verify file format and data structure before upload

---

## Version Information

- **API Version:** 1.1.0
- **Last Updated:** 2025-01-25
- **Documentation Version:** 1.0.0

---

## Related Documentation

- `API_KEY_AUTH_GUIDE.md` - Complete authentication guide
- `POSTMAN_AUTH_SETUP.md` - Postman setup instructions
- `ADMIN_API_README.md` - General admin API documentation
- `CONNECTION_LOSS_HANDLING.md` - Connection loss handling details

