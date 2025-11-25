import { Request, Response, NextFunction } from 'express';
import { parse } from 'csv-parse/sync';

export const parseCSV = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileBuffer = req.file.buffer;
    const fileContent = fileBuffer.toString('utf-8');

    // Parse CSV
    const records = parse(fileContent, {
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

    // Attach parsed data to request body
    req.body = records;
    next();
  } catch (error) {
    next(error);
  }
};

