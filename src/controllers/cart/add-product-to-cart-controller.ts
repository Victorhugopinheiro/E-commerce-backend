import { Request, Response } from 'express';
import AddProductToCartService from '../../services/cart/add-product-to-cart-service';



class AddProductToCartController {
    async handle(req: Request, res: Response) {

        const { productId, quantity, size } = req.body;
        const idUser = req.body.userId;
        

        if (!productId || !quantity) {
            return res.status(400).json({ success: false, message: 'Produto não identificado' });
        }
        

        const serviceAddCart = new AddProductToCartService();
        const resultServiceAddCart = await serviceAddCart.execute({ productId, quantity, userId: idUser, size });

        return res.status(200).json(resultServiceAddCart);



    }
}


export default AddProductToCartController;