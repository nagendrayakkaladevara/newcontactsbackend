import { Request, Response, NextFunction } from 'express';
import { parse } from 'csv-parse/sync';
// @ts-ignore - xlsx doesn't have perfect TypeScript support
import * as XLSX from 'xlsx';
import path from 'path';

/**
 * Normalize column names to handle variations
 * - Case-insensitive matching
 * - Handles whitespace, special characters, and common variations
 */
function normalizeColumnName(columnName: string): string {
  if (!columnName) return '';
  
  // Remove extra whitespace and convert to lowercase
  const normalized = columnName.trim().toLowerCase().replace(/\s+/g, '');
  
  // Map common variations to standard names
  const columnMap: Record<string, string> = {
    'sno': 'sno', // Will be ignored
    'serialnumber': 'sno',
    'serial_number': 'sno',
    'srno': 'sno',
    'sr_no': 'sno',
    'name': 'name',
    'names': 'name',
    'fullname': 'name',
    'full_name': 'name',
    'contactname': 'name',
    'contact_name': 'name',
    'phone': 'phone',
    'phonenumber': 'phone',
    'phone_number': 'phone',
    'mobile': 'phone',
    'mobilenumber': 'phone',
    'mobile_number': 'phone',
    'contact': 'phone',
    'contactnumber': 'phone',
    'contact_number': 'phone',
    'tel': 'phone',
    'telephone': 'phone',
    'designation': 'designation',
    'designations': 'designation',
    'title': 'designation',
    'position': 'designation',
    'jobtitle': 'designation',
    'job_title': 'designation',
    'bloodgroup': 'bloodGroup',
    'blood_group': 'bloodGroup',
    'bloodgroups': 'bloodGroup',
    'blood_groups': 'bloodGroup',
    'bg': 'bloodGroup',
    'bloodtype': 'bloodGroup',
    'blood_type': 'bloodGroup',
    'lobby': 'lobby',
    'lobbies': 'lobby',
    'workingdivision': 'lobby',
    'working_division': 'lobby',
    'division': 'lobby',
    'divisions': 'lobby',
    'department': 'lobby',
    'departments': 'lobby',
    'dept': 'lobby'
  };
  
  return columnMap[normalized] || normalized;
}

/**
 * Normalize phone number format
 * - Handles numbers from Excel (converts to string)
 * - Removes common formatting (spaces, dashes, parentheses)
 * - Preserves + prefix if present
 * - Handles edge cases like empty values, null, undefined
 */
function normalizePhoneNumber(phone: string | number | undefined | null): string {
  if (!phone && phone !== 0) return '';
  
  let phoneStr: string;
  
  // Handle number type (from Excel - convert to string)
  if (typeof phone === 'number') {
    // Convert number to string, removing decimal if present
    phoneStr = Math.round(phone).toString();
  } else {
    phoneStr = String(phone).trim();
  }
  
  // Return empty if after trimming it's empty
  if (!phoneStr) return '';
  
  // Preserve + prefix if present
  const hasPlus = phoneStr.startsWith('+');
  
  // Remove all non-digit characters except + at the start
  if (hasPlus) {
    phoneStr = '+' + phoneStr.substring(1).replace(/\D/g, '');
  } else {
    phoneStr = phoneStr.replace(/\D/g, '');
  }
  
  return phoneStr;
}

/**
 * Parse Excel file and convert to array of objects
 * Handles edge cases: empty sheets, multiple sheets, empty rows
 */
function parseExcelFile(buffer: Buffer): any[] {
  try {
    const workbook = XLSX.read(buffer, { 
      type: 'buffer',
      cellDates: false, // Don't parse dates
      cellNF: false, // Don't parse number formats
      cellText: false // Get raw values
    });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return [];
    }
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      return [];
    }
    
    // Convert to JSON array
    const records = XLSX.utils.sheet_to_json(worksheet, {
      raw: true, // Keep raw values (numbers as numbers, strings as strings)
      defval: null, // Default value for empty cells
      blankrows: false // Skip blank rows
    });
    
    return records || [];
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const parseCSV = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileBuffer = req.file.buffer;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let rawRecords: any[];

    // Handle Excel files (.xlsx, .xls)
    if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      rawRecords = parseExcelFile(fileBuffer);
    } else {
      // Handle CSV files
      const fileContent = fileBuffer.toString('utf-8');
      rawRecords = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
          // Convert empty strings to undefined for optional fields
          if (value === '' && context.column !== 'name' && context.column !== 'phone') {
            return undefined;
          }
          return value;
        }
      });
    }

    // Normalize column names and transform data
    const normalizedRecords = rawRecords
      .map((record: any, index: number) => {
        // Skip completely empty rows
        if (!record || Object.keys(record).length === 0) {
          return null;
        }
        
        const normalized: any = {};
        let hasRequiredFields = false;
        
        // Process each column
        for (const [key, value] of Object.entries(record)) {
          if (!key) continue; // Skip columns with no name
          
          const normalizedKey = normalizeColumnName(key);
          
          // Skip sno column and other ignored columns
          if (normalizedKey === 'sno') {
            continue;
          }
          
          // Handle phone number normalization
          if (normalizedKey === 'phone') {
            const normalizedPhone = normalizePhoneNumber(value as string | number | null | undefined);
            if (normalizedPhone) {
              normalized[normalizedKey] = normalizedPhone;
              hasRequiredFields = true; // Phone is required
            }
          } else {
            // Handle other fields
            let fieldValue = value;
            
            // Convert null/undefined to empty string for optional fields
            if (fieldValue === null || fieldValue === undefined) {
              fieldValue = '';
            } else if (typeof fieldValue === 'number') {
              // Convert numbers to strings for text fields
              fieldValue = fieldValue.toString();
            } else {
              fieldValue = String(fieldValue).trim();
            }
            
            // Only add non-empty values or if it's a required field
            if (normalizedKey === 'name') {
              if (fieldValue) {
                normalized[normalizedKey] = fieldValue;
                hasRequiredFields = true; // Name is required
              }
            } else if (fieldValue) {
              // For optional fields, only add if not empty
              normalized[normalizedKey] = fieldValue;
            }
          }
        }
        
        // Return null if required fields are missing (will be filtered out)
        if (!hasRequiredFields) {
          return null;
        }
        
        return normalized;
      })
      .filter((record: any) => record !== null); // Remove null entries (empty/invalid rows)

    // Attach parsed data to request body
    req.body = normalizedRecords;
    next();
  } catch (error) {
    next(error);
  }
};

