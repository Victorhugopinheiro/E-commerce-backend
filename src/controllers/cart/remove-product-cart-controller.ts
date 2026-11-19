import { Request, Response } from "express";
import RemoveProductCartService from "../../services/cart/remove-product-cart-service";

class RemoveProductCartController {
  async handle(req: Request, res: Response) {
    const { userId, productId, size, model } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ success: false, message: "Dados incompletos" });
    }

    const serviceRemoveProductCart = new RemoveProductCartService();
    const responseRemoveProductCart = await serviceRemoveProductCart.execute({
      userId,
      productId,
      size,
      model,
    });

    return res.status(200).json(responseRemoveProductCart);
  }
}

export default RemoveProductCartController;
