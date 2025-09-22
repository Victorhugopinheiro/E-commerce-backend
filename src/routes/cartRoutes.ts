import { Router } from 'express';
import AddProductToCartController from "../controllers/cart/add-product-to-cart-controller";
import { authCartMiddleware } from '../middleware/authCart';


const router = Router()



router.post('/add', authCartMiddleware, new AddProductToCartController().handle);


export default router;
