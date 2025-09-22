import { Router } from 'express';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
const router = Router();

// Mapeia as rotas para seus respectivos caminhos base
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);

export default router;