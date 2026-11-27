import { Request, Response } from "express";
import RemoveProductCartService from "../../services/cart/remove-product-cart-service";
import { rememberGuest } from "../../lib/cookies";
import { respondCart } from "./respond-cart";

class RemoveProductCartController {
  async handle(req: Request, res: Response) {
    const shopper = req.shopper;
    if (!shopper) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não identificado" });
    }

    const { productId, size, model } = req.body ?? {};

    if (!productId) {
      if (shopper.kind === "guest") rememberGuest(res, shopper.guestId);
      return res
        .status(400)
        .json({ success: false, message: "Dados incompletos" });
    }

    const serviceRemoveProductCart = new RemoveProductCartService();
    const responseRemoveProductCart = await serviceRemoveProductCart.execute({
      shopper,
      productId,
      size,
      model,
    });

    return respondCart(res, shopper, responseRemoveProductCart);
  }
}

export default RemoveProductCartController;
