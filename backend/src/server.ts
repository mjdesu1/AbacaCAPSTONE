import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import maoRoutes from './routes/maoRoutes';
import buyersRoutes from './routes/buyersRoutes';
import farmersRoutes from './routes/farmersRoutes';
import adminRoutes from './routes/adminRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import seedlingRoutes from './routes/seedlingRoutes';
import articlesRoutes from './routes/articlesRoutes';
import teamRoutes from './routes/teamRoutes';

// Import config
import { config } from './config/env';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mao', maoRoutes);
app.use('/api/buyers', buyersRoutes);
app.use('/api/farmers', farmersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/seedlings', seedlingRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/team', teamRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'MAO Culiram Abaca System API' });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});