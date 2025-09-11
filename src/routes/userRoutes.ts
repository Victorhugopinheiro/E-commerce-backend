import { Router } from 'express';
// Assumindo que você terá essas funções no seu userController.ts
import RegisterUserController from '../controllers/user/register-user-controller';
import LoginUserController from '../controllers/user/login-user-controller';

const router = Router();

router.post('/register', new RegisterUserController().handle);
router.post('/login', new LoginUserController().handle);

export default router;