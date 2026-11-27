import { Request, Response } from "express";
import GetAllItemsCartService from "../../services/cart/get-all-items-cart-service";
import { respondCart } from "./respond-cart";

class GetAllItemsCartController {
  async handle(req: Request, res: Response) {
    const shopper = req.shopper;
    if (!shopper) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não identificado" });
    }

    const serviceGetAllItemsCart = new GetAllItemsCartService();
    const responseGetAllItemsCart =
      await serviceGetAllItemsCart.execute(shopper);

    return respondCart(res, shopper, responseGetAllItemsCart);
  }
}

export default GetAllItemsCartController;
