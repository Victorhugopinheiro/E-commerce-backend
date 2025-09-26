import { Request, Response } from "express";
import GetAllItemsCartService from "../../services/cart/get-all-items-cart-service";

interface AuthenticatedRequest extends Request {
    user?: { id: string; email: string };
}

class GetAllItemsCartController {
    async handle(req: AuthenticatedRequest, res: Response) {

         const userId = req.user?.id || req.body.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Usuário não identificado' });
        }

        const serviceGetAllItemsCart = new GetAllItemsCartService();
        const responseGetAllItemsCart = await serviceGetAllItemsCart.execute({ userId });

        return res.status(200).json(responseGetAllItemsCart);

    }
}

export default GetAllItemsCartController;