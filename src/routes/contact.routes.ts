import { Router } from 'express';
import { contactController } from '../controllers/contact.controller';
import { upload } from '../middleware/upload';
import { parseCSV } from '../middleware/csvParser';

const router = Router();

// Single contact operations
router.post('/', contactController.createContact.bind(contactController));
router.put('/:id', contactController.updateContact.bind(contactController));
router.delete('/:id', contactController.deleteContact.bind(contactController));

// Bulk operations
router.post(
  '/bulk-upload',
  upload.single('file'),
  parseCSV,
  contactController.bulkUpload.bind(contactController)
);
router.delete('/', contactController.deleteAllContacts.bind(contactController));

// Search operations
router.get('/', contactController.getAllContacts.bind(contactController));
router.get('/count', contactController.getTotalCount.bind(contactController));
router.get('/search/name', contactController.searchByName.bind(contactController));
router.get('/search/phone', contactController.searchByPhone.bind(contactController));

export default router;

