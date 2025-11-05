// buyersRoutes.ts - Buyers routes
import { Router } from 'express';
import { BuyersController } from '../controllers/BuyersController';

const router = Router();

// Define Buyers routes
router.get('/profile', BuyersController.getBuyerProfile);
router.get('/transactions', BuyersController.getBuyerTransactions);

export default router;