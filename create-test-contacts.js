const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_ENDPOINT = `${API_URL}/api/contacts`;

// Indian names and data (from your existing script)
const firstNames = ['Raj', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Sneha', 'Rahul', 'Kavita', 'Arjun', 'Divya'];
const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Gupta', 'Verma', 'Mehta', 'Joshi', 'Agarwal'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'];
const divisions = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'IT Support', 'Product Management'];
const designations = ['Software Engineer', 'Senior Developer', 'Team Lead', 'Manager', 'Director', 'Associate', 'Executive', 'Analyst'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  return '+91' + Math.floor(1000000000 + Math.random() * 9000000000);
}

function randomEmail(fn, ln) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  return `${fn.toLowerCase()}.${ln.toLowerCase()}@${random(domains)}`;
}

function generateContact() {
  const fn = random(firstNames);
  const ln = random(lastNames);
  const phone = randomPhone();
  const email = randomEmail(fn, ln);
  const bloodGroup = Math.random() > 0.3 ? random(bloodGroups) : undefined;
  
  return {
    name: `${fn} ${ln}`,
    phone: phone,
    email: email,
    bloodGroup: bloodGroup,
    workingDivision: random(divisions),
    designation: random(designations),
    city: random(cities)
  };
}

function makeRequest(contact) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(contact);
    
    const url = new URL(API_ENDPOINT);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 5000
    };

    const req = httpModule.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: parsed,
            contact: contact
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            data: responseData,
            contact: contact,
            error: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        contact: contact,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        contact: contact,
        error: 'Request timeout'
      });
    });

    req.setTimeout(5000);
    req.write(data);
    req.end();
  });
}

async function testConnection() {
  return new Promise((resolve) => {
    const url = new URL(API_URL);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: '/health',
      method: 'GET',
      timeout: 3000
    };

    const req = httpModule.request(options, (res) => {
      resolve({ success: true, status: res.statusCode });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Connection timeout' });
    });

    req.setTimeout(3000);
    req.end();
  });
}

async function createTestContacts(count = 5) {
  console.log(`🚀 Creating ${count} test contacts...`);
  console.log(`📡 API Endpoint: ${API_ENDPOINT}\n`);
  
  // Test connection first
  console.log('🔍 Testing server connection...');
  const connectionTest = await testConnection();
  if (!connectionTest.success) {
    console.error(`❌ Cannot connect to server: ${connectionTest.error}`);
    console.error(`   Make sure your server is running on ${API_URL}`);
    process.exit(1);
  }
  console.log(`✅ Server is reachable!\n`);

  const contacts = [];
  const phoneSet = new Set();
  
  // Generate unique contacts
  while (contacts.length < count) {
    const contact = generateContact();
    if (!phoneSet.has(contact.phone)) {
      phoneSet.add(contact.phone);
      contacts.push(contact);
    }
  }

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  // Create contacts sequentially to avoid conflicts
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    try {
      console.log(`[${i + 1}/${count}] Creating: ${contact.name} (${contact.phone})...`);
      const result = await makeRequest(contact);
      results.push(result);
      
      if (result.success) {
        successCount++;
        console.log(`  ✅ Success! ID: ${result.data.data?.id || 'N/A'}`);
      } else {
        errorCount++;
        console.log(`  ❌ Failed (${result.status}): ${result.data.message || result.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      errorCount++;
      console.log(`  ❌ Error: ${error.error || error.message}`);
      results.push({ contact, error: error.error || error.message });
    }
    
    // Small delay to avoid overwhelming the server
    if (i < contacts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully created: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📝 Total attempted: ${count}`);

  return results;
}

// Run the script
const count = parseInt(process.argv[2]) || 5;
createTestContacts(count)
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

