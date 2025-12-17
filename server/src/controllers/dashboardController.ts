import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

export const DashboardController = {
  getAdminStats: async (req: Request, res: Response) => {
    try {
      const stats = await DashboardService.getAdminStats(req.studioId);
      res.json(stats);
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  },

  getInstructorStats: async (req: Request, res: Response) => {
    try {
      const stats = await DashboardService.getInstructorStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error('Instructor stats error:', error);
      res.status(500).json({ error: 'Failed to fetch instructor stats' });
    }
  }
};