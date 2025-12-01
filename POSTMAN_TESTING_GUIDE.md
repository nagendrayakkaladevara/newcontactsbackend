# Postman Testing Guide for Excel/CSV Upload

This guide will help you test the bulk upload API endpoint using Postman.

## Prerequisites

1. **Start your backend server:**
   ```bash
   npm run dev
   ```
   The server should be running on `http://localhost:3000` (or your configured PORT)

2. **Postman installed** - Download from [postman.com](https://www.postman.com/downloads/)

## Testing the Bulk Upload Endpoint

### Endpoint Details

- **URL:** `http://localhost:3000/api/contacts/bulk-upload`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`

### Step-by-Step Instructions

#### 1. Create a New Request in Postman

1. Open Postman
2. Click **"New"** → **"HTTP Request"**
3. Set method to **POST**
4. Enter URL: `http://localhost:3000/api/contacts/bulk-upload`

#### 2. Configure Query Parameters (Optional)

Click on **"Params"** tab and add:
- **Key:** `replaceAll`
- **Value:** `false` (or `true` to replace all existing contacts)

#### 3. Configure File Upload

1. Go to **"Body"** tab
2. Select **"form-data"** (not raw or x-www-form-urlencoded)
3. In the key field, enter: `file`
4. Hover over the key field and change the type from **"Text"** to **"File"** (click the dropdown)
5. Click **"Select Files"** and choose your Excel (.xlsx, .xls) or CSV (.csv) file

#### 4. Send the Request

Click the **"Send"** button.

## Sample Test Files

### Sample CSV File (`test-contacts.csv`)

Create a file with this content:

```csv
sno,Name,Phone,Designation,Bloodgroup,Lobby
1,John Doe,+919876543210,Manager,A+,Engineering
2,Jane Smith,+919876543211,Developer,B+,Sales
3,Bob Johnson,+919876543212,Designer,O+,Marketing
4,Alice Williams,+919876543213,Analyst,AB+,HR
5,Charlie Brown,+919876543214,Director,A-,Finance
```

### Sample Excel File

Create an Excel file with these columns:
- **sno** (can be any value, will be ignored)
- **Name** (required)
- **Phone** (required, can be with or without + prefix)
- **Designation** (optional)
- **Bloodgroup** (optional, will be normalized: A+, B+, O+, AB+, etc.)
- **Lobby** (optional)

## Expected Responses

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Bulk upload completed. 5 contacts created.",
  "created": 5,
  "errors": [],
  "hasErrors": false
}
```

### Success Response with Errors (201 Created)

```json
{
  "success": true,
  "message": "Bulk upload completed. 3 contacts created.",
  "created": 3,
  "errors": [
    {
      "row": 2,
      "error": "Invalid phone number format"
    },
    {
      "row": 4,
      "error": "Name is required"
    }
  ],
  "hasErrors": true
}
```

### Error Responses

#### No File Uploaded (400 Bad Request)
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

#### Invalid File Type (400 Bad Request)
```json
{
  "success": false,
  "message": "Only CSV and Excel files (.csv, .xlsx, .xls) are allowed"
}
```

#### Invalid Data Format (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid CSV data format"
}
```

## Testing Different Scenarios

### Test Case 1: Valid Excel File
- Upload a properly formatted Excel file
- Expected: All contacts created successfully

### Test Case 2: Valid CSV File
- Upload a properly formatted CSV file
- Expected: All contacts created successfully

### Test Case 3: File with Missing Required Fields
- Upload file with rows missing Name or Phone
- Expected: Those rows are skipped, others are created

### Test Case 4: File with Invalid Phone Numbers
- Upload file with invalid phone formats
- Expected: Invalid rows show errors, valid rows are created

### Test Case 5: File with Duplicate Phone Numbers
- Upload file with duplicate phone numbers
- Expected: First occurrence created, duplicates show errors

### Test Case 6: File with Extra Columns
- Upload file with extra columns (like `sno`, `email`, etc.)
- Expected: Extra columns ignored, valid data processed

### Test Case 7: Empty File
- Upload an empty Excel/CSV file
- Expected: Returns success with 0 contacts created

### Test Case 8: File with Empty Rows
- Upload file with blank rows
- Expected: Empty rows skipped automatically

### Test Case 9: Replace All Mode
- Set `replaceAll=true` in query params
- Expected: All existing contacts deleted, new ones created

## Postman Collection Setup

You can save this as a Postman Collection for easy reuse:

### Collection JSON Structure

```json
{
  "info": {
    "name": "Contacts API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Bulk Upload CSV",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": []
            }
          ]
        },
        "url": {
          "raw": "http://localhost:3000/api/contacts/bulk-upload?replaceAll=false",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "contacts", "bulk-upload"],
          "query": [
            {
              "key": "replaceAll",
              "value": "false"
            }
          ]
        }
      }
    }
  ]
}
```

## Tips for Testing

1. **Check Server Logs:** Watch your terminal where the server is running to see any errors
2. **Test with Small Files First:** Start with 5-10 contacts to verify it works
3. **Verify Data:** After upload, use GET `/api/contacts` to verify contacts were created
4. **Test Edge Cases:** Try files with various formatting issues to ensure robust handling
5. **Use Environment Variables:** Set up Postman environments for different servers (dev, staging, prod)

## Common Issues and Solutions

### Issue: "No file uploaded"
**Solution:** Make sure you selected "File" type in the form-data, not "Text"

### Issue: "Only CSV and Excel files are allowed"
**Solution:** Check file extension is .csv, .xlsx, or .xls

### Issue: "Invalid CSV data format"
**Solution:** Check your CSV file has proper headers and is not corrupted

### Issue: File too large
**Solution:** Current limit is 10MB. Split large files into smaller batches

## Quick Test Script

You can also test using curl:

```bash
# Test with CSV file
curl -X POST "http://localhost:3000/api/contacts/bulk-upload?replaceAll=false" \
  -F "file=@test-contacts.csv"

# Test with Excel file
curl -X POST "http://localhost:3000/api/contacts/bulk-upload?replaceAll=false" \
  -F "file=@test-contacts.xlsx"
```

## Next Steps

After successful upload, test other endpoints:
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/count` - Get total count
- `GET /api/contacts/blood-groups` - Get all blood groups
- `GET /api/contacts/lobbies` - Get all lobbies

