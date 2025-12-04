# Admin API Documentation

This document provides comprehensive documentation for administrative API endpoints in the Contacts Management Backend. These endpoints are designed for administrative operations including contact management and bulk operations.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Update Contact](#update-contact)
- [Delete Contact](#delete-contact)
- [Delete All Contacts](#delete-all-contacts)
- [Bulk Upload (CSV/Excel)](#bulk-upload-csvexcel)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Best Practices](#best-practices)

## Base URL

```
Development: http://localhost:3000
Production: https://your-api-domain.com
```

## Authentication

**⚠️ Note:** Currently, the API does not implement authentication. It is recommended to add authentication middleware (JWT, API keys, etc.) before deploying to production.

**Recommended Implementation:**
- Add JWT token-based authentication
- Implement role-based access control (RBAC)
- Use API keys for service-to-service communication
- Add rate limiting for admin endpoints

---

## Update Contact

Update an existing contact by ID.

**Endpoint:** `PUT /api/contacts/:id`

**URL Parameters:**
- `id` (string, required): Contact UUID

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "+1234567890",
  "bloodGroup": "A+",
  "lobby": "Marketing",
  "designation": "Marketing Manager"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response (200 OK):**
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

**Error Responses:**
- `400 Bad Request`: Validation error
- `404 Not Found`: Contact not found
- `409 Conflict`: Phone number already exists (if updating phone)

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "lobby": "Marketing"
  }'
```

**Example with JavaScript (Fetch API):**
```javascript
const updateContact = async (contactId, updateData) => {
  const response = await fetch(`http://localhost:3000/api/contacts/${contactId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData)
  });
  
  const result = await response.json();
  return result;
};

// Usage
updateContact('550e8400-e29b-41d4-a716-446655440000', {
  name: 'John Doe Updated',
  lobby: 'Marketing'
});
```

---

## Delete Contact

Delete a single contact by ID.

**Endpoint:** `DELETE /api/contacts/:id`

**URL Parameters:**
- `id` (string, required): Contact UUID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid contact ID format
- `404 Not Found`: Contact not found

**Example cURL:**
```bash
curl -X DELETE http://localhost:3000/api/contacts/550e8400-e29b-41d4-a716-446655440000
```

**Example with JavaScript (Fetch API):**
```javascript
const deleteContact = async (contactId) => {
  const response = await fetch(`http://localhost:3000/api/contacts/${contactId}`, {
    method: 'DELETE'
  });
  
  const result = await response.json();
  return result;
};

// Usage
deleteContact('550e8400-e29b-41d4-a716-446655440000');
```

**⚠️ Warning:** This operation is irreversible. The contact will be permanently deleted from the database.

---

## Delete All Contacts

Delete all contacts from the database. This is a destructive operation that requires explicit confirmation.

**Endpoint:** `DELETE /api/contacts?confirm=DELETE_ALL`

**Query Parameters:**
- `confirm` (string, required): Must be exactly `DELETE_ALL` to proceed

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Deleted 150 contacts successfully",
  "count": 150
}
```

**Error Responses:**
- `400 Bad Request`: Missing or incorrect confirmation parameter

**Example cURL:**
```bash
curl -X DELETE "http://localhost:3000/api/contacts?confirm=DELETE_ALL"
```

**Example with JavaScript (Fetch API):**
```javascript
const deleteAllContacts = async () => {
  const response = await fetch('http://localhost:3000/api/contacts?confirm=DELETE_ALL', {
    method: 'DELETE'
  });
  
  const result = await response.json();
  return result;
};

// Usage
deleteAllContacts();
```

**⚠️ Critical Warning:** 
- This operation permanently deletes ALL contacts from the database
- This action cannot be undone
- Use with extreme caution
- Recommended: Backup database before executing
- Consider implementing additional safeguards (e.g., admin authentication, two-factor confirmation)

---

## Bulk Upload (CSV/Excel)

Upload and import multiple contacts from a CSV or Excel file.

**Endpoint:** `POST /api/contacts/bulk-upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**
- `replaceAll` (boolean, optional): 
  - `true`: Replace all existing contacts with uploaded data
  - `false` (default): Add new contacts, skip duplicates

**Request Body:**
- `file` (file, required): CSV or Excel file (.csv, .xlsx, .xls)

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

**Error Responses:**
- `400 Bad Request`: No file uploaded, invalid file format, or invalid data

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/contacts/bulk-upload \
  -F "file=@contacts.csv" \
  -F "replaceAll=false"
```

**Example with JavaScript (FormData):**
```javascript
const bulkUploadContacts = async (file, replaceAll = false) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `http://localhost:3000/api/contacts/bulk-upload?replaceAll=${replaceAll}`,
    {
      method: 'POST',
      body: formData
    }
  );
  
  const result = await response.json();
  return result;
};

// Usage with file input
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const result = await bulkUploadContacts(file, false);
    console.log('Upload result:', result);
  }
});
```

**Performance Notes:**
- Processes 3400 records in 1-3 seconds
- Maximum recommended file size: 10MB
- Large files are processed efficiently using batch operations

**File Format Requirements:**
- CSV files must have headers: `name`, `phone`, `bloodGroup`, `lobby`, `designation`
- Excel files should follow the same column structure
- Phone numbers must be in international format (e.g., `+1234567890`)
- Name and phone are required fields
- Other fields (bloodGroup, lobby, designation) are optional

---

## Error Handling

All admin API endpoints follow a consistent error response format:

### Standard Error Response

```json
{
  "success": false,
  "message": "Error message description",
  "errors": [
    {
      "field": "phone",
      "message": "Invalid phone number format"
    }
  ]
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PUT, DELETE operations
- `201 Created`: Successful POST operations (create)
- `400 Bad Request`: Validation errors, invalid input
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (e.g., phone number already exists)
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

---

## Rate Limiting

**⚠️ Note:** Currently, the API does not implement rate limiting. It is recommended to add rate limiting before deploying to production.

**Recommended Implementation:**
- Admin endpoints: 100 requests per minute per IP
- Bulk operations: 10 requests per minute per IP
- Use middleware like `express-rate-limit` or `rate-limiter-flexible`

---

## Best Practices

### 1. Data Validation
- Always validate input data before sending requests
- Use the provided validation schemas as reference
- Handle validation errors gracefully in your client application

### 2. Bulk Operations
- For large datasets (>1000 records), use CSV/Excel bulk upload
- Always check the `hasErrors` flag in bulk operation responses
- Review error details to identify and fix data quality issues
- Consider backing up data before bulk delete operations
- Test with a small sample file before uploading large datasets

### 3. Error Handling
- Implement proper error handling in your client application
- Display user-friendly error messages
- Log errors for debugging purposes
- Handle network errors and timeouts
- Always check the `success` field in API responses

### 4. Performance
- Use pagination for large datasets
- Monitor API response times
- For bulk uploads, show progress indicators to users
- Handle large file uploads with appropriate timeout settings

### 5. Security
- **⚠️ Critical:** Implement authentication before production deployment
- Use HTTPS in production
- Validate and sanitize all user inputs
- Implement CORS properly
- Use environment variables for sensitive configuration
- Regularly update dependencies

### 6. Data Management
- Regular database backups
- Implement data retention policies
- Clean up test data regularly
- Monitor database size and growth
- Always backup before using "Delete All Contacts" endpoint

### 7. Testing
- Test all endpoints before production deployment
- Test error scenarios
- Test bulk operations with various file sizes
- Test with invalid data to ensure proper error handling
- Load test critical endpoints

### 8. Bulk Upload Best Practices
- Validate CSV/Excel format before upload
- Ensure phone numbers are in correct format
- Remove duplicate entries from source file
- Check file size limits
- Verify column headers match expected format
- Test with a small sample (10-20 records) first

---

## Example Admin Workflow

### Complete Contact Management Workflow

```bash
# 1. Bulk upload contacts from CSV
curl -X POST http://localhost:3000/api/contacts/bulk-upload \
  -F "file=@contacts.csv" \
  -F "replaceAll=false"

# 2. Update a contact
curl -X PUT http://localhost:3000/api/contacts/{contact-id} \
  -H "Content-Type: application/json" \
  -d '{
    "lobby": "Updated Department",
    "designation": "Updated Position"
  }'

# 3. Delete a specific contact
curl -X DELETE http://localhost:3000/api/contacts/{contact-id}

# 4. Delete all contacts (with caution!)
curl -X DELETE "http://localhost:3000/api/contacts?confirm=DELETE_ALL"
```

### JavaScript Example Workflow

```javascript
// 1. Bulk upload contacts
const uploadContacts = async () => {
  const fileInput = document.querySelector('#csvFile');
  const file = fileInput.files[0];
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    'http://localhost:3000/api/contacts/bulk-upload?replaceAll=false',
    {
      method: 'POST',
      body: formData
    }
  );
  
  const result = await response.json();
  
  if (result.success) {
    console.log(`Created ${result.created} contacts`);
    if (result.hasErrors) {
      console.warn('Some errors occurred:', result.errors);
    }
  }
};

// 2. Update a contact
const updateContact = async (contactId, updates) => {
  const response = await fetch(
    `http://localhost:3000/api/contacts/${contactId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }
  );
  
  const result = await response.json();
  return result;
};

// 3. Delete a contact
const deleteContact = async (contactId) => {
  if (!confirm('Are you sure you want to delete this contact?')) {
    return;
  }
  
  const response = await fetch(
    `http://localhost:3000/api/contacts/${contactId}`,
    { method: 'DELETE' }
  );
  
  const result = await response.json();
  return result;
};

// 4. Delete all contacts (with extra confirmation)
const deleteAllContacts = async () => {
  const confirmation = prompt('Type DELETE_ALL to confirm:');
  if (confirmation !== 'DELETE_ALL') {
    alert('Deletion cancelled');
    return;
  }
  
  if (!confirm('⚠️ WARNING: This will delete ALL contacts. Are you absolutely sure?')) {
    return;
  }
  
  const response = await fetch(
    'http://localhost:3000/api/contacts?confirm=DELETE_ALL',
    { method: 'DELETE' }
  );
  
  const result = await response.json();
  return result;
};
```

---

## Support & Troubleshooting

### Common Issues

1. **Bulk upload fails with "Invalid CSV data format"**
   - Ensure CSV has proper headers: name, phone, bloodGroup, lobby, designation
   - Check for empty rows or malformed data
   - Verify phone number formats (must include country code, e.g., +1234567890)
   - Ensure file is saved as UTF-8 encoding

2. **Delete all contacts returns 400 error**
   - Ensure `confirm=DELETE_ALL` query parameter is exactly as specified (case-sensitive)
   - URL encode if necessary
   - Check that the query parameter is properly formatted

3. **Update contact returns 404 error**
   - Verify the contact ID is correct
   - Ensure the contact exists in the database
   - Check that the ID format is valid UUID

4. **Bulk upload processes but shows errors**
   - Review the `errors` array in the response
   - Check specific row numbers mentioned in errors
   - Fix data issues in source file and re-upload
   - Common issues: invalid phone format, missing required fields, duplicate phone numbers

5. **Excel file not processing correctly**
   - Ensure column headers match expected format (case-insensitive)
   - Check that phone numbers are not stored as formulas
   - Verify file is saved in .xlsx or .xls format
   - Try converting to CSV if issues persist

### Getting Help

- Check the main [README.md](./README.md) for general API documentation
- Review error messages for specific validation issues
- Check server logs for detailed error information
- Verify file format and data structure before upload

---

## Version Information

- **API Version:** 1.0.2
- **Last Updated:** 2025-01-25
- **Documentation Version:** 1.0.0

---

## License

ISC
