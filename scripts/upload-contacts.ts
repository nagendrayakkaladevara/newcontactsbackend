import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CSV_FILE = path.join(process.cwd(), 'test-contacts-indian.csv');
const REPLACE_ALL = process.env.REPLACE_ALL === 'true' ? 'true' : 'false';

async function uploadContacts() {
  try {
    // Check if file exists
    if (!fs.existsSync(CSV_FILE)) {
      console.error(`❌ CSV file not found: ${CSV_FILE}`);
      console.log('💡 Run the generate script first: npx ts-node scripts/generate-test-data.ts');
      process.exit(1);
    }

    console.log(`📤 Uploading contacts from ${CSV_FILE}...`);
    console.log(`🌐 API URL: ${API_URL}/api/contacts/bulk-upload`);
    console.log(`🔄 Replace All: ${REPLACE_ALL}`);

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(CSV_FILE), {
      filename: 'test-contacts-indian.csv',
      contentType: 'text/csv'
    });

    // Upload to API
    const response = await fetch(`${API_URL}/api/contacts/bulk-upload?replaceAll=${REPLACE_ALL}`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Upload successful!');
      console.log(`📊 Created: ${result.created} contacts`);
      
      if (result.hasErrors && result.errors.length > 0) {
        console.log(`⚠️  Errors: ${result.errors.length}`);
        console.log('\nFirst 5 errors:');
        result.errors.slice(0, 5).forEach((error: any) => {
          console.log(`  Row ${error.row}: ${error.error}`);
        });
      } else {
        console.log('✨ No errors!');
      }
      
      console.log(`\n📝 Message: ${result.message}`);
    } else {
      console.error('\n❌ Upload failed!');
      console.error('Response:', JSON.stringify(result, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error uploading contacts:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

uploadContacts();




