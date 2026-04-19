import { Router } from 'express';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';
import webhookRoutes from './apiRoutes'; 
import { authMiddleware } from '../middleware/adminMiddlewere';
import WebhookController from '../controllers/api/webhookController';
const router = Router();

// Mapeia as rotas para seus respectivos caminhos base
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use("/webhook", webhookRoutes );
export default router;