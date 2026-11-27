import { Request, Response } from "express";
import AddProductToCartService from "../../services/cart/add-product-to-cart-service";
import { rememberGuest } from "../../lib/cookies";
import { respondCart } from "./respond-cart";

class AddProductToCartController {
  async handle(req: Request, res: Response) {
    const shopper = req.shopper;
    if (!shopper) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não identificado" });
    }

    const { productId, quantity, size, model, name } = req.body ?? {};

    if (!productId || !quantity) {
      if (shopper.kind === "guest") rememberGuest(res, shopper.guestId);
      return res
        .status(400)
        .json({ success: false, message: "Produto não identificado" });
    }

    const serviceAddCart = new AddProductToCartService();
    const resultServiceAddCart = await serviceAddCart.execute({
      productId,
      quantity,
      shopper,
      size,
      model,
      name,
    });

    return respondCart(res, shopper, resultServiceAddCart);
  }
}

export default AddProductToCartController;
