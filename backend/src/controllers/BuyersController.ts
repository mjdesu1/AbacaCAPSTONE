// BuyersController.ts - Buyers controller
import { Request, Response } from 'express';
import { BuyersService } from '../services/BuyersService';

export class BuyersController {
  // Get buyer profile
  static async getBuyerProfile(req: Request, res: Response) {
    try {
      const buyerProfile = await BuyersService.getBuyerProfile();
      res.status(200).json(buyerProfile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch buyer profile' });
    }
  }

  // Get buyer transactions
  static async getBuyerTransactions(req: Request, res: Response) {
    try {
      const transactions = await BuyersService.getBuyerTransactions();
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch buyer transactions' });
    }
  }
}