import { Router } from 'express';
import CreateCategoryController from '../controllers/category/create-category-controller';
import DeleteCategoryController from '../controllers/category/delete-category-controller';
import ListCategoryController from '../controllers/category/list-category-controller';
import { authMiddleware } from '../middleware/adminMiddlewere';
import { upload } from '../middleware/multer';

const router = Router();

router.post('/add', authMiddleware, upload.single('image'), new CreateCategoryController().handle);
router.delete('/delete', authMiddleware, new DeleteCategoryController().handle);
router.get('/list', new ListCategoryController().handle);

export default router;
