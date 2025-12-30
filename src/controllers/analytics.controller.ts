import { Request, Response, NextFunction } from 'express';
import { contactService } from '../services/contact.service';
import { AppError } from '../middleware/errorHandler';

export class AnalyticsController {
  /**
   * Get analytics overview
   * GET /api/analytics/overview
   */
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await contactService.getAnalyticsOverview();
      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get blood group distribution
   * GET /api/analytics/blood-groups
   */
  async getBloodGroupDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await contactService.getBloodGroupDistribution();
      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get lobby distribution
   * GET /api/analytics/lobbies
   */
  async getLobbyDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await contactService.getLobbyDistribution();
      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get designation distribution
   * GET /api/analytics/designations
   */
  async getDesignationDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await contactService.getDesignationDistribution();
      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get contacts growth over time
   * GET /api/analytics/growth?days=30
   */
  async getContactsGrowth(req: Request, res: Response, next: NextFunction) {
    try {
      const { days } = req.query;
      const daysNum = days ? parseInt(String(days), 10) : 30;

      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        throw new AppError('Days must be between 1 and 365', 400, 'INVALID_DAYS');
      }

      const growth = await contactService.getContactsGrowth(daysNum);
      res.json({
        success: true,
        data: growth
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent contacts
   * GET /api/analytics/recent?limit=10
   */
  async getRecentContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(String(limit), 10) : 10;

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new AppError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
      }

      const recent = await contactService.getRecentContacts(limitNum);
      res.json({
        success: true,
        data: recent
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Increment and get visit count (thread-safe)
   * POST /api/analytics/visits
   */
  async incrementVisitCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await contactService.incrementVisitCount();
      res.json({
        success: true,
        data: {
          visitCount: count
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get visit count without incrementing
   * GET /api/analytics/visits
   */
  async getVisitCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await contactService.getVisitCount();
      res.json({
        success: true,
        data: {
          visitCount: count
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get visit history for charting
   * GET /api/analytics/visits/history?days=30
   */
  async getVisitHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { days } = req.query;
      const daysNum = days ? parseInt(String(days), 10) : 30;

      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        throw new AppError('Days must be between 1 and 365', 400, 'INVALID_DAYS');
      }

      const history = await contactService.getVisitHistory(daysNum);
      const totalVisits = await contactService.getVisitCount();

      res.json({
        success: true,
        data: history,
        period: `${daysNum} days`,
        totalVisits
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();

