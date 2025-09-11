import { Request, Response } from 'express';
import DetailProductService from '../../services/product/detail-product-service';

class DetailProductController {
   async handle(req: Request, res: Response) {
       
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID é obrigatório' });
        }

        const serviceDetailProduct = new DetailProductService();
        const resultDetailProduct = await serviceDetailProduct.execute(productId);

        return res.json(resultDetailProduct);


       
    }
}

export default DetailProductController;