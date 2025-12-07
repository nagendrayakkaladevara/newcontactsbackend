import { PrismaClient, Document } from '@prisma/client';
import { createDocumentSchema } from '../validators/document.validator';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class DocumentService {
  /**
   * Create a new document
   */
  async createDocument(data: z.infer<typeof createDocumentSchema>): Promise<Document> {
    const validated = createDocumentSchema.parse(data);
    
    return prisma.document.create({
      data: {
        title: validated.title,
        link: validated.link,
        uploadedBy: validated.uploadedBy || null
      }
    });
  }

  /**
   * Update an existing document
   */
  async updateDocument(
    id: string,
    data: Partial<z.infer<typeof createDocumentSchema>>
  ): Promise<Document> {
    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    return prisma.document.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.link && { link: data.link }),
        ...(data.uploadedBy !== undefined && { uploadedBy: data.uploadedBy || null })
      }
    });
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    await prisma.document.delete({ where: { id } });
  }

  /**
   * Get all documents with pagination
   */
  async getAllDocuments(
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResult<Document>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.document.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.document.count()
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get all documents without pagination
   */
  async getAllDocumentsWithoutPagination(): Promise<Document[]> {
    return prisma.document.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get a single document by ID
   */
  async getDocumentById(id: string): Promise<Document | null> {
    return prisma.document.findUnique({ where: { id } });
  }

  /**
   * Search documents by title
   */
  async searchDocumentsByTitle(
    query: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResult<Document>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.document.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.document.count({
        where: {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        }
      })
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get total count of documents
   */
  async getTotalCount(): Promise<number> {
    return prisma.document.count();
  }

  /**
   * Delete all documents
   */
  async deleteAllDocuments(): Promise<{ count: number }> {
    const result = await prisma.document.deleteMany();
    return { count: result.count };
  }

  /**
   * Bulk upload documents from JSON array
   */
  async bulkUploadDocuments(
    documents: Array<z.infer<typeof createDocumentSchema>>,
    replaceAll: boolean = false
  ): Promise<{ 
    created: number; 
    errors: Array<{ 
      row: number; 
      error: string;
      type: string;
      field?: string;
    }>;
    report: {
      total: number;
      created: number;
      failed: number;
      errorsByType: Record<string, number>;
      errorsByField: Record<string, number>;
    };
  }> {
    // If replaceAll is true, delete all existing documents first
    if (replaceAll) {
      await prisma.document.deleteMany();
    }

    const errors: Array<{ 
      row: number; 
      error: string;
      type: string;
      field?: string;
    }> = [];
    const validDocuments: Array<z.infer<typeof createDocumentSchema>> = [];

    // Helper function to parse Zod errors into user-friendly messages
    const parseZodError = (error: z.ZodError): { message: string; field?: string; type: string } => {
      // Check if issues array exists and has elements (ZodError uses 'issues', not 'errors')
      if (!error.issues || !Array.isArray(error.issues) || error.issues.length === 0) {
        return {
          message: 'Validation failed',
          type: 'validation_error'
        };
      }

      const firstError = error.issues[0];
      
      // Check if firstError exists and has required properties
      if (!firstError) {
        return {
          message: 'Validation failed',
          type: 'validation_error'
        };
      }

      let message = firstError.message || 'Validation failed';
      const field = (firstError.path && Array.isArray(firstError.path)) 
        ? firstError.path.join('.') 
        : '';
      
      // Make error messages more user-friendly
      const errorCode = firstError.code as string;
      if (errorCode === 'too_small') {
        message = `${field ? `${field}: ` : ''}Value is too short`;
      } else if (errorCode === 'too_big') {
        message = `${field ? `${field}: ` : ''}Value is too long`;
      } else if (errorCode === 'invalid_type') {
        message = `${field ? `${field}: ` : ''}Invalid value type`;
      } else if (errorCode === 'invalid_string' || errorCode === 'invalid_format') {
        message = `${field ? `${field}: ` : ''}Invalid format`;
      }
      
      return {
        message,
        field: field || undefined,
        type: firstError.code || 'validation_error'
      };
    };

    // Validate documents
    documents.forEach((document, index) => {
      try {
        const validated = createDocumentSchema.parse(document);
        validDocuments.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const parsed = parseZodError(error);
          errors.push({
            row: index + 1,
            error: parsed.message,
            type: parsed.type,
            field: parsed.field
          });
        } else {
          let errorMessage = 'Validation failed';
          if (error instanceof Error) {
            errorMessage = error.message
              .replace(/[A-Z]:\\[^\s]+/gi, '')
              .replace(/\/[^\s]+\.(ts|js)/g, '')
              .trim() || 'Validation failed';
          }
          errors.push({
            row: index + 1,
            error: errorMessage,
            type: 'validation_error'
          });
        }
      }
    });

    // Generate error report
    const errorsByType: Record<string, number> = {};
    const errorsByField: Record<string, number> = {};
    
    errors.forEach(err => {
      errorsByType[err.type] = (errorsByType[err.type] || 0) + 1;
      if (err.field) {
        errorsByField[err.field] = (errorsByField[err.field] || 0) + 1;
      }
    });

    const report = {
      total: documents.length,
      created: 0,
      failed: errors.length,
      errorsByType,
      errorsByField
    };

    if (validDocuments.length === 0) {
      return { created: 0, errors, report };
    }

    // Prepare data for bulk insert
    const dataToInsert = validDocuments.map(doc => ({
      title: doc.title,
      link: doc.link,
      uploadedBy: doc.uploadedBy || null
    }));

    // Bulk insert documents
    try {
      if (replaceAll) {
        // If replacing all, use createMany
        const result = await prisma.document.createMany({
          data: dataToInsert
        });
        report.created = result.count;
        return {
          created: result.count,
          errors,
          report
        };
      } else {
        // For incremental updates, process in chunks
        const chunkSize = 500;
        let created = 0;
        
        for (let i = 0; i < dataToInsert.length; i += chunkSize) {
          const chunk = dataToInsert.slice(i, i + chunkSize);
          await prisma.$transaction(
            chunk.map(data =>
              prisma.document.create({
                data
              })
            )
          );
          created += chunk.length;
        }

        report.created = created;
        return {
          created,
          errors,
          report
        };
      }
    } catch (error) {
      // Fallback: try individual inserts for better error reporting
      let created = 0;
      for (let i = 0; i < dataToInsert.length; i++) {
        try {
          await prisma.document.create({
            data: dataToInsert[i]
          });
          created++;
        } catch (err: any) {
          const originalIndex = validDocuments.findIndex(
            vd => vd.title === dataToInsert[i].title && vd.link === dataToInsert[i].link
          );
          let errorMessage = 'Insert failed';
          let errorType = 'insert_error';
          if (err instanceof Error) {
            errorMessage = err.message
              .replace(/[A-Z]:\\[^\s]+/gi, '')
              .replace(/\/[^\s]+\.(ts|js)/g, '')
              .trim() || 'Insert failed';
          }
          errors.push({
            row: originalIndex >= 0 ? documents.indexOf(validDocuments[originalIndex]) + 1 : i + 1,
            error: errorMessage,
            type: errorType
          });
        }
      }
      report.created = created;
      report.failed = errors.length;
      // Recalculate error statistics
      const updatedErrorsByType: Record<string, number> = {};
      const updatedErrorsByField: Record<string, number> = {};
      errors.forEach(err => {
        updatedErrorsByType[err.type] = (updatedErrorsByType[err.type] || 0) + 1;
        if (err.field) {
          updatedErrorsByField[err.field] = (updatedErrorsByField[err.field] || 0) + 1;
        }
      });
      report.errorsByType = updatedErrorsByType;
      report.errorsByField = updatedErrorsByField;
      return { created, errors, report };
    }
  }
}

export const documentService = new DocumentService();

