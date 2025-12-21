const http = require('http');
const https = require('https');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const count = parseInt(process.argv[2]) || 5;

const contacts = [
  { name: 'Raj Kumar', phone: '+911234567890', email: 'raj.kumar@gmail.com', bloodGroup: 'O+', workingDivision: 'Engineering', designation: 'Software Engineer', city: 'Mumbai' },
  { name: 'Priya Sharma', phone: '+911234567891', email: 'priya.sharma@gmail.com', bloodGroup: 'A+', workingDivision: 'Sales', designation: 'Manager', city: 'Delhi' },
  { name: 'Amit Patel', phone: '+911234567892', email: 'amit.patel@gmail.com', bloodGroup: 'B+', workingDivision: 'Marketing', designation: 'Executive', city: 'Bangalore' },
  { name: 'Anjali Singh', phone: '+911234567893', email: 'anjali.singh@gmail.com', bloodGroup: 'AB+', workingDivision: 'HR', designation: 'Associate', city: 'Hyderabad' },
  { name: 'Vikram Reddy', phone: '+911234567894', email: 'vikram.reddy@gmail.com', bloodGroup: 'O-', workingDivision: 'Finance', designation: 'Analyst', city: 'Chennai' },
  { name: 'Sneha Gupta', phone: '+911234567895', email: 'sneha.gupta@gmail.com', bloodGroup: 'A-', workingDivision: 'Operations', designation: 'Team Lead', city: 'Kolkata' },
  { name: 'Rahul Verma', phone: '+911234567896', email: 'rahul.verma@gmail.com', bloodGroup: 'B-', workingDivision: 'IT Support', designation: 'Senior Developer', city: 'Pune' },
  { name: 'Kavita Mehta', phone: '+911234567897', email: 'kavita.mehta@gmail.com', bloodGroup: 'AB-', workingDivision: 'Product Management', designation: 'Director', city: 'Ahmedabad' },
  { name: 'Arjun Joshi', phone: '+911234567898', email: 'arjun.joshi@gmail.com', bloodGroup: 'O+', workingDivision: 'Engineering', designation: 'Software Engineer', city: 'Jaipur' },
  { name: 'Divya Agarwal', phone: '+911234567899', email: 'divya.agarwal@gmail.com', bloodGroup: 'A+', workingDivision: 'Sales', designation: 'Manager', city: 'Surat' }
];

function makeRequest(contact) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}/api/contacts`);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    const data = JSON.stringify(contact);
    
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
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, success: res.statusCode >= 200 && res.statusCode < 300, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, success: false, data: responseData });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.setTimeout(5000);
    req.write(data);
    req.end();
  });
}

(async () => {
  const toCreate = contacts.slice(0, count);
  console.log(`Creating ${toCreate.length} contacts...\n`);
  
  for (let i = 0; i < toCreate.length; i++) {
    const contact = toCreate[i];
    try {
      process.stdout.write(`[${i + 1}/${toCreate.length}] ${contact.name}... `);
      const result = await makeRequest(contact);
      if (result.success) {
        console.log('✓');
      } else {
        console.log(`✗ (${result.status})`);
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
    }
    if (i < toCreate.length - 1) await new Promise(r => setTimeout(r, 100));
  }
  
  console.log('\nDone!');
})();



