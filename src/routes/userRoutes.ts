import { Router } from 'express';
// Assumindo que você terá essas funções no seu userController.ts
import RegisterUserController from '../controllers/user/register-user-controller';
import LoginUserController from '../controllers/user/login-user-controller';
import AdminUserController from '../controllers/user/admin-user-controller';
import UserDetailController from '../controllers/user/user-detail.controller';
import { authCartMiddleware } from '../middleware/authCart';

const router = Router();

router.post('/register', new RegisterUserController().handle);
router.post('/login', new LoginUserController().handle);
router.post('/admin', new AdminUserController().handle);
router.get("/userDetails", authCartMiddleware, new UserDetailController().handle);

export default router;