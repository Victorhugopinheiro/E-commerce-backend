import { Request, Response } from "express";
import CreateOrderService from "../../services/orders/create-order-service";
import { checkoutInputFromRequest, runCheckout } from "./finish-checkout";

class CreateOrderController {
  async handle(req: Request, res: Response) {
    const input = checkoutInputFromRequest(req);
    if (!input) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não identificado" });
    }

    const createOrderService = new CreateOrderService();
    return runCheckout(res, input.shopper, () =>
      createOrderService.execute(input)
    );
  }
}

export default CreateOrderController;
