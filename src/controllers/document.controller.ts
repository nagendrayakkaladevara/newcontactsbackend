import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/document.service';
import {
  createDocumentSchema,
  documentIdSchema,
  documentPaginationSchema,
  documentSearchSchema
} from '../validators/document.validator';
import { AppError } from '../middleware/errorHandler';

export class DocumentController {
  /**
   * Create a new document
   * POST /api/documents
   */
  async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createDocumentSchema.parse(req.body);
      const document = await documentService.createDocument(data);
      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a document
   * PUT /api/documents/:id
   */
  async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = documentIdSchema.parse({ id: req.params.id });
      const data = createDocumentSchema.partial().parse(req.body);
      const document = await documentService.updateDocument(id, data);
      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a document
   * DELETE /api/documents/:id
   */
  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = documentIdSchema.parse({ id: req.params.id });
      await documentService.deleteDocument(id);
      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all documents with pagination
   * GET /api/documents?page=1&limit=50
   */
  async getAllDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = documentPaginationSchema.parse(req.query);
      const result = await documentService.getAllDocuments(page, limit);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all documents without pagination
   * GET /api/documents/all
   */
  async getAllDocumentsWithoutPagination(req: Request, res: Response, next: NextFunction) {
    try {
      const documents = await documentService.getAllDocumentsWithoutPagination();
      res.json({
        success: true,
        data: documents,
        count: documents.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single document by ID
   * GET /api/documents/:id
   */
  async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = documentIdSchema.parse({ id: req.params.id });
      const document = await documentService.getDocumentById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search documents by title
   * GET /api/documents/search?query=railway&page=1&limit=50
   */
  async searchDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, page, limit } = documentSearchSchema.parse({
        query: req.query.query,
        page: req.query.page,
        limit: req.query.limit
      });
      const result = await documentService.searchDocumentsByTitle(query, page, limit);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get total count of documents
   * GET /api/documents/count
   */
  async getTotalCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await documentService.getTotalCount();
      res.json({
        success: true,
        count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all documents
   * DELETE /api/documents?confirm=DELETE_ALL
   */
  async deleteAllDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { confirm } = req.query;
      if (confirm !== 'DELETE_ALL') {
        throw new AppError(
          'Confirmation required. Use ?confirm=DELETE_ALL',
          400,
          'MISSING_CONFIRMATION'
        );
      }
      const result = await documentService.deleteAllDocuments();
      res.json({
        success: true,
        message: `Deleted ${result.count} documents successfully`,
        count: result.count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk create documents from JSON array
   * POST /api/documents/admin/bulk
   */
  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const replaceAll = req.query.replaceAll === 'true';
      const documents = req.body;

      // Validate request body
      if (!documents) {
        throw new AppError('Request body is required', 400, 'MISSING_BODY');
      }

      if (!Array.isArray(documents)) {
        throw new AppError('Request body must be an array of documents', 400, 'INVALID_FORMAT');
      }

      if (documents.length === 0) {
        throw new AppError('Documents array cannot be empty', 400, 'EMPTY_ARRAY');
      }

      if (documents.length > 1000) {
        throw new AppError('Maximum 1000 documents allowed per request', 400, 'TOO_MANY_DOCUMENTS');
      }

      const result = await documentService.bulkUploadDocuments(documents, replaceAll);
      
      res.status(201).json({
        success: true,
        message: `Bulk create completed. ${result.created} documents created.`,
        created: result.created,
        errors: result.errors,
        hasErrors: result.errors.length > 0,
        report: result.report
      });
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();

