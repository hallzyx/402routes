/**
 * Guardian routes - AI Budget Guardian endpoints
 */

import { Router } from 'express';
import { guardianController } from '../controllers/guardian.controller.js';

const router = Router();

// Budget configuration
router.post('/budget/config', guardianController.createBudgetConfig);
router.get('/budget/status/:userAddress', guardianController.getBudgetStatus);

// Alerts
router.get('/alerts/:userAddress', guardianController.getAlerts);
router.post('/alerts/:alertId/mark-read', guardianController.markAlertRead);

// Optimizations
router.get('/optimizations/:userAddress', guardianController.getOptimizations);
router.post('/optimizations/:optimizationId/apply', guardianController.applyOptimization);

// Analysis
router.post('/analyze', guardianController.analyzeSpending);

// Reports
router.get('/report/:userAddress/monthly', guardianController.getMonthlyReport);

// Health
router.get('/health', guardianController.healthCheck);

export default router;
