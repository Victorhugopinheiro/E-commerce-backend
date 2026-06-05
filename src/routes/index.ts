import { Router } from 'express';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';
import addressRoutes from './addressRoutes';
import webhookRoutes from './apiRoutes'; 
import { authMiddleware } from '../middleware/adminMiddlewere';
import WebhookController from '../controllers/api/webhookController';
import shippingRoutes from './shippingRoutes';
const router = Router();

// Mapeia as rotas para seus respectivos caminhos base
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use("/address", addressRoutes);
router.use("/webhook", webhookRoutes );
router.use("/shipping", shippingRoutes)
export default router;