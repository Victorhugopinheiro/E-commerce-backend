import { Router } from 'express';
import AddProductToCartController from "../controllers/cart/add-product-to-cart-controller";
import { authCartMiddleware } from '../middleware/authCart';
import RemoveProductCartController from '../controllers/cart/remove-product-cart-controller';
import GetAllItemsCartController from '../controllers/cart/get-all-items-cart-controller';


const router = Router()

 
router.post('/add', authCartMiddleware, new AddProductToCartController().handle);
router.delete('/remove', authCartMiddleware, new RemoveProductCartController().handle);
router.post('/items', authCartMiddleware ,new GetAllItemsCartController().handle);


export default router;
