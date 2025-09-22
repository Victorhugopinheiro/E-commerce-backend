import { Router } from 'express';
import AddProductController from '../controllers/product/add-product-controller';
import { upload } from '../middleware/multer';
import ListProductController from '../controllers/product/list-product-controller';
import DeleteProductController from '../controllers/product/delete-product-controller';
import DetailProductController from '../controllers/product/detail-product-controller';
import { authMiddleware } from '../middleware/adminMiddlewere';



const router = Router();



router.post('/add',authMiddleware, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 },
{ name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]),
    new AddProductController().handle);


router.get('/list', new ListProductController().handle);

router.delete('/delete', authMiddleware, new DeleteProductController().handle);

router.get('/detail', authMiddleware, new DetailProductController().handle);


export default router;