import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';
import { upload } from '../middleware/upload';
import { parseCSV } from '../middleware/csvParser';
import { auth } from '../middleware/auth';
import { bulkOperationLimiter, strictLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication (API key or Basic auth)
router.use(auth);

// Single contact operations
router.post('/admin/createContact', contactController.createContact.bind(contactController));
router.put('/admin/updateContact/:id', contactController.updateContact.bind(contactController));
router.delete('/admin/deleteContact/:id', contactController.deleteContact.bind(contactController));

// Bulk operations (with rate limiting)
router.post(
  '/admin/bulk-upload',
  bulkOperationLimiter,
  upload.single('file'),
  parseCSV,
  contactController.bulkUpload.bind(contactController)
);
router.post('/admin/bulk', bulkOperationLimiter, contactController.bulkCreate.bind(contactController));

// Delete all contacts (with strict rate limiting)
router.delete('/admin/deleteAllContacts', strictLimiter, contactController.deleteAllContacts.bind(contactController));

// Search operations (available to all authenticated users, including readonly)
router.get('/', contactController.getAllContacts.bind(contactController));
router.get('/all', contactController.getAllContactsWithoutPagination.bind(contactController));
router.get('/count', contactController.getTotalCount.bind(contactController));
router.get('/blood-groups', contactController.getBloodGroups.bind(contactController));
router.get('/lobbies', contactController.getLobbies.bind(contactController));
router.get('/designations', contactController.getDesignations.bind(contactController));
router.get('/search/name', contactController.searchByName.bind(contactController));
router.get('/search/phone', contactController.searchByPhone.bind(contactController));

// Unified filter endpoint (recommended)
router.get('/filter', contactController.filterContacts.bind(contactController));

// Deprecated endpoints
router.get('/by-blood-group', contactController.getContactsByBloodGroup.bind(contactController));
router.get('/by-lobby', contactController.getContactsByLobby.bind(contactController));

export default router;

