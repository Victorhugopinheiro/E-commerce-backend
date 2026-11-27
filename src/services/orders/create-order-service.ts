import PrepareCheckoutService, {
  CheckoutInput,
} from "./prepare-checkout-service";

class CreateOrderService {
  async execute(input: CheckoutInput) {
    const prepareCheckoutService = new PrepareCheckoutService();
    const prepared = await prepareCheckoutService.execute(input);

    if (!prepared.success) return prepared;

    return {
      success: true as const,
      message: "Pedido criado com sucesso",
      order: prepared.order,
      guestId: prepared.guestId,
    };
  }
}

export default CreateOrderService;
