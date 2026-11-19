import orderModel from "../../model/orderModel";
import userModel from "../../model/userModel";
import CartItem from "../../types/cart";
import { CreateOrderRequest } from "../../types/order";
import type {
  AsaasCheckoutSessionResponse,
  AsaasErrorResponse,
  AsaasCheckoutSession,
} from "../../types/checkoutTypes";
import userIdentificationModel from "../../model/userIdentification";
import {
  priceOrderItems,
  sameCartLine,
} from "../product/resolve-purchase-line";

type AsaasCustomerResponse = {
  id: string;
};

type AsaasPaymentResponse = {
  id: string;
  invoiceUrl?: string;
  transactionReceiptUrl?: string;
};

class CreateOrderAsaasService {
  private readonly asaasBaseUrl =
    process.env.ASAAS_BASE_URL || "https://api-sandbox.asaas.com/v3";
  private readonly deliveryFee = 5;

  private isErrorResponse(
    response: AsaasCheckoutSessionResponse
  ): response is AsaasErrorResponse {
    return "errors" in response;
  }

  private isSuccessResponse(
    response: AsaasCheckoutSessionResponse
  ): response is AsaasCheckoutSession {
    return !this.isErrorResponse(response);
  }

  private getHeaders() {
    const apiKey = process.env.ASAAS_SANDBOX_API_KEY;

    if (!apiKey) {
      throw new Error("Variável ASAAS_API_KEY não definida");
    }

    return {
      accept: "application/json",
      "User-Agent": "NomeDaSuaAplicacao/1.0.0",
      "content-type": "application/json",
      access_token: apiKey,
    };
  }

  private getBillingType(paymentMethod: string) {
    const normalizedPaymentMethod = paymentMethod.trim().toUpperCase();

    if (["PIX", "CREDIT_CARD", "BOLETO"].includes(normalizedPaymentMethod)) {
      return normalizedPaymentMethod;
    }

    return "PIX";
  }

  private getDueDate() {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    return dueDate.toISOString().split("T")[0];
  }

  async execute({
    items,
    paymentMethod,
    shippingAddress,
    userId,
  }: CreateOrderRequest) {
    try {
      const user = await userModel.findById(userId);

      if (!user) {
        return { success: false, message: "Usuário não encontrado" };
      }

      const userIdentification = await userIdentificationModel.findOne({
        userId: user._id,
      });

      if (!userIdentification || !userIdentification.userCpf) {
        return { success: false, message: "Usuário não possui CPF cadastrado" };
      }

      let customerId = user.asaasCustomerId;

      if (!customerId) {
        const customerResponse = await fetch(`${this.asaasBaseUrl}/customers`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify({
            name: user.name,
            email: user.email,
          }),
        });

        if (!customerResponse.ok) {
          const errorText = await customerResponse.text();
          return {
            success: false,
            message: "Erro ao criar cliente no Asaas",
            error: errorText,
          };
        }

        const customer =
          (await customerResponse.json()) as AsaasCustomerResponse;

        await userModel.findByIdAndUpdate(
          userId,
          { asaasCustomerId: customer.id },
          { new: true }
        );
        customerId = customer.id;
      }

      const priced = await priceOrderItems(items);
      if (!priced.ok) {
        return { success: false, message: priced.message };
      }

      const orderItems = priced.orderItems;
      const subtotalAmount = priced.total;

      const totalAmount = subtotalAmount + this.deliveryFee;

      const newOrder = await orderModel.create({
        userId,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod: this.getBillingType(paymentMethod),
        status: "pending",
        paymentStatus: "pending",
        date: Date.now(),
      });

      const existingCheckout = await orderModel.findById(newOrder._id);

      if (existingCheckout?.checkoutUrl) {
        return {
          success: true,
          message: "Pedido criado com sucesso",
          checkoutUrl: existingCheckout.checkoutUrl,
        };
      }

      const paymentResponse = await fetch(`${this.asaasBaseUrl}/checkouts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          billingTypes: ["PIX", "CREDIT_CARD"],
          chargeTypes: ["DETACHED", "INSTALLMENT"],
          minutesToExpire: 10,
          externalReference: newOrder._id.toString(),
          callback: {
            successUrl: "https://example.com/asaas/checkout/success",
            cancelUrl: "https://example.com/asaas/checkout/cancel",
            expiredUrl: "https://example.com/asaas/checkout/expired",
          },
          items: orderItems.map((item) => ({
            externalReference: item.productId,
            name: item.model ? `${item.name} (${item.model})` : item.name,
            quantity: item.quantity,
            value: item.price,
            description: item.model ?? item.name,
          })),
          customerData: {
            name: "John Doe",
            cpfCnpj: userIdentification.userCpf,
            email: user.email,
            phone: shippingAddress.phone,
            address: shippingAddress.street,
            addressNumber: shippingAddress.street.split(" ")[0] || "0",
            complement: "",
            province: shippingAddress.state,
            postalCode: shippingAddress.zipCode,
            city: 12987382,
          },
        }),
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        return {
          success: false,
          message: "Erro ao gerar checkout no Asaas",
          error: errorText,
          order: newOrder,
        };
      }

      const payment =
        (await paymentResponse.json()) as AsaasCheckoutSessionResponse;

      if (this.isErrorResponse(payment)) {
        return {
          success: false,
          message: "Erro ao gerar checkout no Asaas",
          errors: payment.errors,
          order: newOrder,
        };
      }

      const atOrder = await orderModel.findByIdAndUpdate(
        newOrder._id,
        {
          checkoutUrl: payment.link,
          checkoutId: payment.id,
        },
        {
          new: true,
        }
      );

      console.log("orderAtt", atOrder);

      const rawCart = user.cartData;
      const itemsCart: CartItem[] = Array.isArray(rawCart) ? [...rawCart] : [];

      for (const item of orderItems) {
        const cartItemIndex = itemsCart.findIndex((cartItem) =>
          sameCartLine(cartItem, item)
        );

        if (cartItemIndex !== -1) {
          itemsCart.splice(cartItemIndex, 1);
        }
      }

      await userModel.findByIdAndUpdate(
        userId,
        { cartData: itemsCart },
        { new: true }
      );

      return {
        success: true,
        message: "Pedido criado com sucesso",
        order: atOrder,
        checkoutUrl: payment.link,
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Erro no servidor", err };
    }
  }
}

export default CreateOrderAsaasService;
