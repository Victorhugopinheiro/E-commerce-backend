
import { Router } from 'express';
import { authCartMiddleware } from '../middleware/authCart';
import ValidateCepController from '../controllers/shipping/validateCepController';
import CalculatingCepController from '../controllers/shipping/calculatingCepController';


const router = Router()


router.get("/validateCep",  new ValidateCepController().handle);
router.post("/calculateShipping",  new CalculatingCepController().handle);



export default router;