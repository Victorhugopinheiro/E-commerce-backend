import { Router } from "express";
import CreateOrderController from "../controllers/orders/create-order-controller";
import GetAllOrdersController from "../controllers/orders/get-all-orders-controller";
import GetUserOrdersController from "../controllers/orders/get-user-orders-controller";
import { authCartMiddleware } from "../middleware/authCart";
import { authMiddleware } from "../middleware/adminMiddlewere";
import ChangeOrderStatusController from "../controllers/orders/change-order-status-controller";


const router = Router()


router.post('/create', authCartMiddleware ,new CreateOrderController().handle);
router.post('/list', authMiddleware ,new GetAllOrdersController().handle);
router.post('/user-orders', authCartMiddleware ,new GetUserOrdersController().handle);
router.patch('/update-status', authMiddleware ,new ChangeOrderStatusController().handle);






export default router;



