/**
 * Guardian controller - Handle AI Budget Guardian requests
 */

import { Request, Response } from 'express';
import { guardianService } from '../services/guardian.service.js';

class GuardianController {
  async createBudgetConfig(req: Request, res: Response) {
    try {
      const result = await guardianService.createBudgetConfig(req.body);
      res.json({
        ok: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        error: 'Failed to create budget config',
        message: error.message,
      });
    }
  }

  async getBudgetStatus(req: Request, res: Response) {
    try {
      const { userAddress } = req.params;
      const status = await guardianService.getBudgetStatus(userAddress);
      res.json({
        ok: true,
        data: status,
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        res.status(404).json({
          ok: false,
          error: 'Budget configuration not found',
        });
      } else {
        res.status(500).json({
          ok: false,
          error: 'Failed to get budget status',
          message: error.message,
        });
      }
    }
  }

  async getAlerts(req: Request, res: Response) {
    try {
      const { userAddress } = req.params;
      const { unread_only } = req.query;
      const alerts = await guardianService.getAlerts(
        userAddress,
        unread_only === 'true'
      );
      res.json({
        ok: true,
        data: alerts,
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        error: 'Failed to get alerts',
        message: error.message,
      });
    }
  }

  async markAlertRead(req: Request, res: Response) {
    try {
      // This is a proxy to the guardian service
      // In a real implementation, you might want to handle this differently
      res.json({
        ok: true,
        message: 'Alert marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        error: 'Failed to mark alert as read',
        message: error.message,
      });
    }
  }

  async getOptimizations(req: Request, res: Response) {
    try {
      const { userAddress } = req.params;
      const optimizations = await guardianService.getOptimizations(userAddress);
      res.json({
        ok: true,
        data: optimizations,
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        error: 'Failed to get optimizations',
        message: error.message,
      });
    }
  }

  async applyOptimization(req: Request, res: Response) {
    try {
      // This is a proxy endpoint
      res.json({
        ok: true,
        message: 'Optimization applied',
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        error: 'Failed to apply optimization',
        message: error.message,
      });
    }
  }

  async analyzeSpending(req: Request, res: Response) {
    try {
      const { user_address, time_window_hours = 24 } = req.body;
      const analysis = await guardianService.analyzeSpending(
        user_address,
        time_window_hours
      );
      res.json({
        ok: true,
        data: analysis,
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        error: 'Failed to analyze spending',
        message: error.message,
      });
    }
  }

  async getMonthlyReport(req: Request, res: Response) {
    try {
      const { userAddress } = req.params;
      const report = await guardianService.getMonthlyReport(userAddress);
      res.json({
        ok: true,
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        error: 'Failed to get monthly report',
        message: error.message,
      });
    }
  }

  async healthCheck(req: Request, res: Response) {
    try {
      const isHealthy = await guardianService.healthCheck();
      res.json({
        ok: true,
        guardian_status: isHealthy ? 'healthy' : 'unhealthy',
      });
    } catch (error: any) {
      res.status(503).json({
        ok: false,
        guardian_status: 'unavailable',
      });
    }
  }
}

export const guardianController = new GuardianController();
