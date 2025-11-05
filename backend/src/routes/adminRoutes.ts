// routes/adminRoutes.ts - Admin routes for system monitoring and management
import { Router } from 'express';
import { 
  getCaptchaStatistics, 
  unblockIP 
} from '../middleware/captchaMiddleware';
import { authenticate, authorizeMAO } from '../middleware/auth';

const router = Router();

/**
 * Admin Routes - Protected by authentication and MAO authorization
 * Only association officers can access these endpoints
 */

/**
 * GET /api/admin/captcha/statistics
 * Get CAPTCHA security statistics
 * Returns: IP statistics, blocked IPs, recent attempts
 */
router.get(
  '/captcha/statistics',
  authenticate,
  authorizeMAO,
  getCaptchaStatistics
);

/**
 * POST /api/admin/captcha/unblock
 * Unblock a specific IP address
 * Body: { ip: string }
 */
router.post(
  '/captcha/unblock',
  authenticate,
  authorizeMAO,
  unblockIP
);

/**
 * GET /api/admin/health
 * System health check
 */
router.get('/health', authenticate, authorizeMAO, (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

export default router;
