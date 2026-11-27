import { Request, Response } from "express";
import CreateOrderAsaasService from "../../services/orders/create-order-asaas-service";
import { checkoutInputFromRequest, runCheckout } from "./finish-checkout";

class CreateOrderAsaasController {
  async handle(req: Request, res: Response) {
    const input = checkoutInputFromRequest(req);
    if (!input) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não identificado" });
    }

    const createOrderService = new CreateOrderAsaasService();
    return runCheckout(res, input.shopper, () =>
      createOrderService.execute(input)
    );
  }
}

export default CreateOrderAsaasController;
