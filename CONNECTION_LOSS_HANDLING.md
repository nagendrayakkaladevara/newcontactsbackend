# Connection Loss Handling During Bulk Upload

## 🔍 What Happens If Connection Is Lost?

### **Before the Improvements:**

If the connection was lost during a 3200-contact upload:

1. ❌ **Partial Data Saved**: Contacts processed in completed chunks (500 each) would remain in the database
2. ❌ **No Response**: Client would get no response or a timeout error
3. ❌ **No Visibility**: No way to know which contacts were successfully uploaded
4. ❌ **Manual Cleanup**: You'd have to manually check the database to see what was saved
5. ❌ **Unsafe Retry**: Retrying could cause confusion about what was already uploaded

### **After the Improvements:**

Now if connection is lost:

1. ✅ **Partial Success Reported**: You get a clear response showing how many contacts were uploaded
2. ✅ **Safe to Retry**: The upload is idempotent - retrying won't create duplicates
3. ✅ **Clear Error Messages**: You know exactly what happened and what to do
4. ✅ **Progress Tracking**: You can see how many contacts were processed before the connection was lost

## 📊 How It Works

### Chunk-Based Processing

The upload processes contacts in chunks of 500:
- Each chunk is processed in a database transaction
- If a chunk succeeds, it's committed immediately
- If connection is lost, only completed chunks are saved

### Connection Loss Detection

The system detects connection loss by checking for:
- Database connection timeouts (`P1001`, `P1008`)
- Network errors (`ECONNRESET`, `ETIMEDOUT`)
- Transaction timeouts

### Response Format on Connection Loss

When connection is lost, you'll receive a **206 Partial Content** response:

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

## 🔄 Safe Retry Mechanism

### Why It's Safe to Retry

The upload uses **upsert** operations, which means:
- If a contact already exists (by phone number), it will be **updated**, not duplicated
- If a contact doesn't exist, it will be **created**
- No duplicate contacts will be created

### Example Scenario

1. **First Upload**: 3200 contacts, connection lost after 1500
   - Result: 1500 contacts saved

2. **Retry Upload**: Same 3200 contacts file
   - First 1500 contacts: Updated (already exist)
   - Remaining 1700 contacts: Created (new)
   - Result: All 3200 contacts in database

## ⚙️ Technical Details

### Chunk Processing

```typescript
// Process in chunks of 500
const chunkSize = 500;
for (let i = 0; i < dataToInsert.length; i += chunkSize) {
  const chunk = dataToInsert.slice(i, i + chunkSize);
  try {
    await prisma.$transaction(
      chunk.map(data =>
        prisma.contact.upsert({
          where: { phone: data.phone },
          update: data,
          create: data
        })
      ),
      {
        timeout: 30000, // 30 second timeout per chunk
      }
    );
    created += chunk.length;
  } catch (chunkError) {
    // Detect connection loss and break
    if (isConnectionError(chunkError)) {
      connectionLost = true;
      break;
    }
  }
}
```

### Error Detection

The system detects these connection-related errors:
- `P1001`: Prisma connection timeout
- `P1008`: Prisma transaction timeout
- `ECONNRESET`: Connection reset by peer
- `ETIMEDOUT`: Connection timeout
- Messages containing "timeout" or "connection"

## 📈 Performance Considerations

### Why 4-5 Minutes for 3200 Contacts?

- **Validation**: Each contact is validated before insertion
- **Deduplication**: Checking for duplicates within the batch
- **Chunk Processing**: Processing in chunks of 500 with transactions
- **Database Operations**: Each contact requires an upsert operation

### Optimization Tips

1. **Use `replaceAll=true`** for faster uploads (if you want to replace all existing contacts)
2. **Network Stability**: Ensure stable network connection
3. **Database Performance**: Optimize database indexes
4. **Server Resources**: Ensure adequate server resources

## 🛡️ Best Practices

### For Large Uploads (>1000 contacts):

1. **Monitor Progress**: Check the response for `processedContacts` and `notProcessedContacts`
2. **Retry Safely**: If connection is lost, simply retry the same file
3. **Verify Results**: After upload, verify the count matches expected
4. **Use Replace Mode**: If appropriate, use `replaceAll=true` for faster processing

### For Very Large Uploads (>5000 contacts):

Consider:
- Splitting into smaller files (1000-2000 contacts each)
- Using a background job queue (future enhancement)
- Processing during off-peak hours

## 🔮 Future Enhancements

Potential improvements:
1. **Progress Webhooks**: Real-time progress updates via webhooks
2. **Resume Capability**: Resume from last successful chunk
3. **Background Jobs**: Process large uploads asynchronously
4. **Upload History**: Track upload sessions and their status
5. **Batch API**: Dedicated endpoint for batch operations with job tracking

## 📝 Example: Handling Connection Loss in Your UI

```javascript
async function uploadContacts(file) {
  try {
    const response = await fetch('/api/contacts/bulk-upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.connectionLost) {
      // Show partial success message
      showMessage(
        `Connection lost! ${result.created} contacts uploaded. ` +
        `${result.report.notProcessedContacts} contacts not processed. ` +
        `You can safely retry the upload.`
      );
      
      // Offer retry button
      showRetryButton(() => uploadContacts(file));
    } else if (result.success) {
      showMessage(`Successfully uploaded ${result.created} contacts!`);
    } else {
      showErrors(result.errors);
    }
  } catch (error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      showMessage('Connection timeout. Please check your upload status and retry if needed.');
    } else {
      showMessage('Upload failed. Please try again.');
    }
  }
}
```

## ✅ Summary

**Key Improvements:**
- ✅ Detects connection loss during upload
- ✅ Reports partial success clearly
- ✅ Safe to retry (idempotent operations)
- ✅ Clear error messages and guidance
- ✅ Progress tracking in response

**What You Should Do:**
- If connection is lost, simply retry the upload
- The system will update existing contacts and create new ones
- No duplicates will be created
- Check the `report` object for detailed statistics

