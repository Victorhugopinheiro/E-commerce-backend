import { Router } from 'express';
// Assumindo que você terá essas funções no seu userController.ts
import RegisterUserController from '../controllers/user/register-user-controller';
import LoginUserController from '../controllers/user/login-user-controller';
import AdminUserController from '../controllers/user/admin-user-controller';
import UserDetailController from '../controllers/user/user-detail.controller';
import { authCartMiddleware } from '../middleware/authCart';
import UserLogoutController from '../controllers/user/logout-user-controller';
import { authMiddleware } from '../middleware/adminMiddlewere';
import LogoutAdmingController from '../controllers/user/logout-admin-controller';

const router = Router();

router.post('/register', new RegisterUserController().handle);
router.post('/login', new LoginUserController().handle);
router.post('/admin', new AdminUserController().handle);
router.get("/userDetails", authCartMiddleware, new UserDetailController().handle);
router.post("/logout", authCartMiddleware, new UserLogoutController().handle);
router.post("/logoutAdmin", new LogoutAdmingController().handle)
router.get("/adminDetails", authMiddleware, new AdminUserController().handle)

export default router;