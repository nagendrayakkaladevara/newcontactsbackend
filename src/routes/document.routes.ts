import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { auth } from '../middleware/auth';
import { bulkOperationLimiter, strictLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication (API key or Basic auth)
router.use(auth);

// Admin operations (create, update, delete)
router.post('/admin/createDocument', documentController.createDocument.bind(documentController));
router.post('/admin/bulk', bulkOperationLimiter, documentController.bulkCreate.bind(documentController));
router.put('/admin/updateDocument/:id', documentController.updateDocument.bind(documentController));
router.delete('/admin/deleteDocument/:id', documentController.deleteDocument.bind(documentController));
router.delete('/admin/deleteAllDocuments', strictLimiter, documentController.deleteAllDocuments.bind(documentController));

// Read operations (available to all authenticated users)
router.get('/', documentController.getAllDocuments.bind(documentController));
router.get('/all', documentController.getAllDocumentsWithoutPagination.bind(documentController));
router.get('/count', documentController.getTotalCount.bind(documentController));
router.get('/search', documentController.searchDocuments.bind(documentController));
router.get('/:id', documentController.getDocumentById.bind(documentController));

export default router;

