import { Router } from 'express';
// Assumindo que você terá essas funções no seu userController.ts
import RegisterUserController from '../controllers/user/register-user-controller';

const router = Router();

router.post('/register', new RegisterUserController().handle);


export default router;