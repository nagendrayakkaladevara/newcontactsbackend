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
   * Get all unique blood groups
   * GET /api/contacts/blood-groups
   */
  async getBloodGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const bloodGroups = await contactService.getAllBloodGroups();
      res.json({
        success: true,
        data: bloodGroups
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get contacts by blood group(s) and/or lobby(s)
   * @deprecated Use GET /api/contacts/filter instead
   * GET /api/contacts/by-blood-group?bloodGroup=A+&page=1&limit=50
   * GET /api/contacts/by-blood-group?bloodGroup=A+,B+,O+&page=1&limit=50
   * GET /api/contacts/by-blood-group?bloodGroup=A+&lobby=X&page=1&limit=50
   * GET /api/contacts/by-blood-group?bloodGroup=A+,B+&lobby=X,Y&page=1&limit=50
   * GET /api/contacts/by-blood-group?lobby=X&page=1&limit=50
   */
  async getContactsByBloodGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { bloodGroup, lobby, page, limit } = req.query;

      // Parse blood groups - optional, support comma-separated or single value
      let bloodGroups: string[] | undefined;
      if (bloodGroup && typeof bloodGroup === 'string') {
        bloodGroups = bloodGroup.split(',').map(bg => bg.trim()).filter(bg => bg !== '');
        if (bloodGroups.length === 0) {
          bloodGroups = undefined;
        }
      }

      // Parse lobbies - optional, support comma-separated or single value
      let lobbies: string[] | undefined;
      if (lobby && typeof lobby === 'string') {
        lobbies = lobby.split(',').map(l => l.trim()).filter(l => l !== '');
        if (lobbies.length === 0) {
          lobbies = undefined;
        }
      }

      // At least one filter (bloodGroup or lobby) must be provided
      if (!bloodGroups && !lobbies) {
        throw new AppError('At least one of bloodGroup or lobby is required', 400, 'MISSING_FILTER');
      }

      // Parse pagination with defaults
      const pageNum = page ? parseInt(String(page), 10) : 1;
      const limitNum = limit ? parseInt(String(limit), 10) : 50;

      if (isNaN(pageNum) || pageNum < 1) {
        throw new AppError('Page must be a positive number', 400, 'INVALID_PAGE');
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new AppError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
      }

      const result = await contactService.getContactsByBloodGroup(bloodGroups, pageNum, limitNum, lobbies);
      
      res.json({
        success: true,
        ...result,
        deprecated: true,
        message: 'This endpoint is deprecated. Please use GET /api/contacts/filter instead.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all unique lobbies
   * GET /api/contacts/lobbies
   */
  async getLobbies(req: Request, res: Response, next: NextFunction) {
    try {
      const lobbies = await contactService.getAllLobbies();
      res.json({
        success: true,
        data: lobbies
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all unique designations
   * GET /api/contacts/designations
   */
  async getDesignations(req: Request, res: Response, next: NextFunction) {
    try {
      const designations = await contactService.getAllDesignations();
      res.json({
        success: true,
        data: designations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Filter contacts with unified filters (bloodGroup, lobby, designation)
   * GET /api/contacts/filter?bloodGroup=A+&lobby=X&designation=Manager&page=1&limit=50
   * 
   * This is the recommended endpoint for filtering contacts.
   * Supports filtering by bloodGroup, lobby, and/or designation in a single request.
   */
  async filterContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { bloodGroup, lobby, designation, page, limit } = req.query;

      // Parse blood groups - optional, support comma-separated or single value
      let bloodGroups: string[] | undefined;
      if (bloodGroup && typeof bloodGroup === 'string') {
        bloodGroups = bloodGroup.split(',').map(bg => bg.trim()).filter(bg => bg !== '');
        if (bloodGroups.length === 0) {
          bloodGroups = undefined;
        }
      }

      // Parse lobbies - optional, support comma-separated or single value
      let lobbies: string[] | undefined;
      if (lobby && typeof lobby === 'string') {
        lobbies = lobby.split(',').map(l => l.trim()).filter(l => l !== '');
        if (lobbies.length === 0) {
          lobbies = undefined;
        }
      }

      // Parse designations - optional, support comma-separated or single value
      let designations: string[] | undefined;
      if (designation && typeof designation === 'string') {
        designations = designation.split(',').map(d => d.trim()).filter(d => d !== '');
        if (designations.length === 0) {
          designations = undefined;
        }
      }

      // At least one filter must be provided
      if (!bloodGroups && !lobbies && !designations) {
        throw new AppError('At least one filter (bloodGroup, lobby, or designation) is required', 400, 'MISSING_FILTER');
      }

      // Parse pagination with defaults
      const pageNum = page ? parseInt(String(page), 10) : 1;
      const limitNum = limit ? parseInt(String(limit), 10) : 50;

      if (isNaN(pageNum) || pageNum < 1) {
        throw new AppError('Page must be a positive number', 400, 'INVALID_PAGE');
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new AppError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
      }

      const result = await contactService.filterContacts(
        {
          bloodGroup: bloodGroups,
          lobby: lobbies,
          designation: designations
        },
        pageNum,
        limitNum
      );
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get contacts by lobby(s) and/or designation(s)
   * @deprecated Use GET /api/contacts/filter instead
   * GET /api/contacts/by-lobby?lobby=Engineering&page=1&limit=50
   * GET /api/contacts/by-lobby?lobby=Engineering,Sales&page=1&limit=50
   * GET /api/contacts/by-lobby?lobby=X&designation=x,y&page=1&limit=50
   * GET /api/contacts/by-lobby?lobby=A,B&designation=x,z&page=1&limit=50
   * GET /api/contacts/by-lobby?designation=x,y&page=1&limit=50
   */
  async getContactsByLobby(req: Request, res: Response, next: NextFunction) {
    try {
      const { lobby, designation, page, limit } = req.query;

      // Parse lobbies - optional, support comma-separated or single value
      let lobbies: string[] | undefined;
      if (lobby && typeof lobby === 'string') {
        lobbies = lobby.split(',').map(l => l.trim()).filter(l => l !== '');
        if (lobbies.length === 0) {
          lobbies = undefined;
        }
      }

      // Parse designations - optional, support comma-separated or single value
      let designations: string[] | undefined;
      if (designation && typeof designation === 'string') {
        designations = designation.split(',').map(d => d.trim()).filter(d => d !== '');
        if (designations.length === 0) {
          designations = undefined;
        }
      }

      // At least one filter (lobby or designation) must be provided
      if (!lobbies && !designations) {
        throw new AppError('At least one of lobby or designation is required', 400, 'MISSING_FILTER');
      }

      // Parse pagination with defaults
      const pageNum = page ? parseInt(String(page), 10) : 1;
      const limitNum = limit ? parseInt(String(limit), 10) : 50;

      if (isNaN(pageNum) || pageNum < 1) {
        throw new AppError('Page must be a positive number', 400, 'INVALID_PAGE');
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new AppError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
      }

      const result = await contactService.getContactsByLobby(lobbies, pageNum, limitNum, designations);
      
      res.json({
        success: true,
        ...result,
        deprecated: true,
        message: 'This endpoint is deprecated. Please use GET /api/contacts/filter instead.'
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

  /**
   * Bulk create contacts from JSON array
   * POST /api/contacts/bulk
   */
  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const replaceAll = req.query.replaceAll === 'true';
      const contacts = req.body;

      // Validate request body
      if (!contacts) {
        throw new AppError('Request body is required', 400, 'MISSING_BODY');
      }

      if (!Array.isArray(contacts)) {
        throw new AppError('Request body must be an array of contacts', 400, 'INVALID_FORMAT');
      }

      if (contacts.length === 0) {
        throw new AppError('Contacts array cannot be empty', 400, 'EMPTY_ARRAY');
      }

      if (contacts.length > 1000) {
        throw new AppError('Maximum 1000 contacts allowed per request', 400, 'TOO_MANY_CONTACTS');
      }

      const result = await contactService.bulkUploadContacts(contacts, replaceAll);
      
      res.status(201).json({
        success: true,
        message: `Bulk create completed. ${result.created} contacts created.`,
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

