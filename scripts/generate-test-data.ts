import fs from 'fs';
import path from 'path';

// Indian first names
const firstNames = [
  'Raj', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Sneha', 'Rahul', 'Kavita',
  'Arjun', 'Divya', 'Suresh', 'Meera', 'Karan', 'Pooja', 'Rohan', 'Neha',
  'Aditya', 'Shreya', 'Vishal', 'Ananya', 'Nikhil', 'Isha', 'Ravi', 'Tanvi',
  'Kiran', 'Aishwarya', 'Siddharth', 'Riya', 'Manish', 'Sakshi', 'Deepak', 'Swati',
  'Harsh', 'Anushka', 'Yash', 'Kritika', 'Abhishek', 'Nisha', 'Gaurav', 'Pallavi',
  'Mohit', 'Richa', 'Akash', 'Shruti', 'Varun', 'Aditi', 'Kunal', 'Jyoti',
  'Ritesh', 'Monika', 'Saurabh', 'Preeti', 'Ankit', 'Sapna', 'Prateek', 'Radha',
  'Vivek', 'Shilpa', 'Naveen', 'Deepika', 'Manoj', 'Kiran', 'Ashish', 'Madhuri',
  'Rohit', 'Suman', 'Sandeep', 'Rekha', 'Pankaj', 'Sunita', 'Ajay', 'Lakshmi',
  'Vinod', 'Geeta', 'Sanjay', 'Uma', 'Rajesh', 'Sarita', 'Mahesh', 'Kamala',
  'Dinesh', 'Pushpa', 'Sunil', 'Lata', 'Naresh', 'Asha', 'Jitendra', 'Sushila'
];

// Indian last names
const lastNames = [
  'Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Gupta', 'Verma', 'Mehta',
  'Joshi', 'Agarwal', 'Malhotra', 'Kapoor', 'Chopra', 'Nair', 'Iyer', 'Rao',
  'Desai', 'Shah', 'Pandey', 'Mishra', 'Jain', 'Bansal', 'Goyal', 'Arora',
  'Saxena', 'Tiwari', 'Yadav', 'Khan', 'Ali', 'Hussain', 'Ahmed', 'Rahman',
  'Naidu', 'Menon', 'Nambiar', 'Krishnan', 'Subramanian', 'Raman', 'Venkatesh',
  'Srinivasan', 'Lakshmanan', 'Murthy', 'Raghavan', 'Krishnamurthy', 'Swamy',
  'Bhatt', 'Trivedi', 'Dwivedi', 'Shukla', 'Srivastava', 'Sinha', 'Bose', 'Banerjee'
];

// Indian cities
const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
  'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
  'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad',
  'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi',
  'Srinagar', 'Amritsar', 'Noida', 'Ranchi', 'Howrah', 'Jabalpur', 'Gwalior'
];

// Working divisions
const divisions = [
  'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations',
  'IT Support', 'Product Management', 'Quality Assurance', 'Research & Development',
  'Customer Service', 'Business Development', 'Administration', 'Legal',
  'Supply Chain', 'Manufacturing', 'Healthcare', 'Education'
];

// Designations
const designations = [
  'Software Engineer', 'Senior Developer', 'Team Lead', 'Manager', 'Director',
  'Associate', 'Executive', 'Analyst', 'Consultant', 'Specialist', 'Coordinator',
  'Supervisor', 'VP', 'CEO', 'CTO', 'CFO', 'Project Manager', 'Product Manager',
  'Business Analyst', 'Data Scientist', 'DevOps Engineer', 'QA Engineer',
  'Sales Executive', 'Marketing Manager', 'HR Manager', 'Accountant'
];

// Blood groups
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Generate random phone number
function generatePhone(): string {
  const prefixes = ['+91', '91', ''];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return prefix ? `${prefix}${number}` : number;
}

// Generate email from name
function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const variations = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}`
  ];
  const email = variations[Math.floor(Math.random() * variations.length)];
  return `${email}@${domain}`;
}

// Generate a single contact
function generateContact(index: number): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const phone = generatePhone();
  const email = generateEmail(firstName, lastName);
  const bloodGroup = Math.random() > 0.3 ? bloodGroups[Math.floor(Math.random() * bloodGroups.length)] : '';
  const workingDivision = divisions[Math.floor(Math.random() * divisions.length)];
  const designation = designations[Math.floor(Math.random() * designations.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];

  return `${name},${phone},${email},${bloodGroup},${workingDivision},${designation},${city}`;
}

// Generate CSV file
function generateCSV(numRecords: number): void {
  const header = 'name,phone,email,bloodGroup,workingDivision,designation,city';
  const records: string[] = [header];

  // Use Set to track phone numbers and ensure uniqueness
  const phoneSet = new Set<string>();

  for (let i = 0; i < numRecords; i++) {
    let contact = generateContact(i);
    let phone = contact.split(',')[1];

    // Regenerate if phone number already exists
    let attempts = 0;
    while (phoneSet.has(phone) && attempts < 10) {
      contact = generateContact(i);
      phone = contact.split(',')[1];
      attempts++;
    }

    if (!phoneSet.has(phone)) {
      phoneSet.add(phone);
      records.push(contact);
    }
  }

  const csvContent = records.join('\n');
  const filePath = path.join(process.cwd(), 'test-contacts-indian.csv');
  fs.writeFileSync(filePath, csvContent, 'utf-8');
  console.log(`✅ Generated ${records.length - 1} contact records in ${filePath}`);
  console.log(`📊 Total unique phone numbers: ${phoneSet.size}`);
}

// Generate 150 records
const numRecords = 150;
console.log(`🚀 Generating ${numRecords} Indian contact records...`);
generateCSV(numRecords);

