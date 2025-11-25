import { Request, Response, NextFunction } from 'express';
import { contactService } from '../services/contact.service';
import {
  createContactSchema,
  updateContactSchema,
  contactIdSchema,
  paginationSchema,
  searchSchema,
  deleteAllSchema
} from '../validators/contact.validator';
import { AppError } from '../middleware/errorHandler';

export class ContactController {
  /**
   * Create a single contact
   * POST /api/contacts
   */
  async createContact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createContactSchema.parse(req.body);
      const contact = await contactService.createContact(data);
      res.status(201).json({
        success: true,
        data: contact
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a single contact
   * PUT /api/contacts/:id
   */
  async updateContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = contactIdSchema.parse({ id: req.params.id });
      const data = createContactSchema.partial().parse(req.body);
      const contact = await contactService.updateContact(id, data);
      res.json({
        success: true,
        data: contact
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a single contact
   * DELETE /api/contacts/:id
   */
  async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = contactIdSchema.parse({ id: req.params.id });
      await contactService.deleteContact(id);
      res.json({
        success: true,
        message: 'Contact deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete all contacts
   * DELETE /api/contacts?confirm=DELETE_ALL
   */
  async deleteAllContacts(req: Request, res: Response, next: NextFunction) {
    try {
      deleteAllSchema.parse(req.query);
      const result = await contactService.deleteAllContacts();
      res.json({
        success: true,
        message: `Deleted ${result.count} contacts successfully`,
        count: result.count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all contacts with pagination
   * GET /api/contacts?page=1&limit=50
   */
  async getAllContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await contactService.getAllContacts(page, limit);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search contacts by name
   * GET /api/contacts/search/name?query=ra&page=1&limit=50
   */
  async searchByName(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, page, limit } = searchSchema.parse({
        query: req.query.query,
        page: req.query.page,
        limit: req.query.limit
      });
      const result = await contactService.searchByName(query, page, limit);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search contact by phone
   * GET /api/contacts/search/phone?phone=1234567890
   */
  async searchByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.query;
      if (!phone || typeof phone !== 'string') {
        throw new AppError('Phone number is required');
      }
      const contact = await contactService.searchByPhone(phone);
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }
      res.json({
        success: true,
        data: contact
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get total count of contacts
   * GET /api/contacts/count
   */
  async getTotalCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await contactService.getTotalCount();
      res.json({
        success: true,
        count
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk upload contacts from CSV
   * POST /api/contacts/bulk-upload
   */
  async bulkUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const replaceAll = req.query.replaceAll === 'true';
      const csvData = req.body; // Assuming CSV is parsed by middleware

      if (!Array.isArray(csvData)) {
        throw new AppError('Invalid CSV data format');
      }

      const result = await contactService.bulkUploadContacts(csvData, replaceAll);
      
      res.status(201).json({
        success: true,
        message: `Bulk upload completed. ${result.created} contacts created.`,
        created: result.created,
        errors: result.errors,
        hasErrors: result.errors.length > 0
      });
    } catch (error) {
      next(error);
    }
  }
}

export const contactController = new ContactController();

