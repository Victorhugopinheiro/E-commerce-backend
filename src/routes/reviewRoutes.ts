import { Router } from 'express';
import CreateReviewController from '../controllers/review/create-review-controller';
import ListReviewController from '../controllers/review/list-review-controller';
import DeleteReviewController from '../controllers/review/delete-review-controller';
import { upload } from '../middleware/multer';
import { authMiddleware } from '../middleware/adminMiddlewere';

const router = Router();

router.post('/add', authMiddleware, upload.single('media'), new CreateReviewController().handle);
router.get('/list', authMiddleware, new ListReviewController().handle);
router.delete('/delete', authMiddleware, new DeleteReviewController().handle);

export default router;
