import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { auth } from '../middleware/auth';

const router = Router();

// All analytics routes require authentication (API key or Basic auth)
router.use(auth);

// Analytics endpoints (available to all authenticated users)
router.get('/overview', analyticsController.getOverview.bind(analyticsController));
router.get('/blood-groups', analyticsController.getBloodGroupDistribution.bind(analyticsController));
router.get('/lobbies', analyticsController.getLobbyDistribution.bind(analyticsController));
router.get('/designations', analyticsController.getDesignationDistribution.bind(analyticsController));
router.get('/growth', analyticsController.getContactsGrowth.bind(analyticsController));
router.get('/recent', analyticsController.getRecentContacts.bind(analyticsController));
router.post('/visits', analyticsController.incrementVisitCount.bind(analyticsController));
router.get('/visits', analyticsController.getVisitCount.bind(analyticsController));
router.get('/visits/history', analyticsController.getVisitHistory.bind(analyticsController));

export default router;

