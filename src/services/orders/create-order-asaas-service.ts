import userModel from "../../model/userModel";
import type {
  AsaasCheckoutSessionResponse,
  AsaasErrorResponse,
} from "../../types/checkoutTypes";
import PrepareCheckoutService, {
  CheckoutIdentity,
  CheckoutInput,
  CheckoutShipping,
} from "./prepare-checkout-service";

type AsaasCustomerResponse = {
  id: string;
};

type PreparedSuccess = {
  order: {
    _id: { toString(): string };
    shippingAddress?: {
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      zipCode?: string;
      ibgeCode?: string;
    };
    checkoutUrl?: string;
    checkoutId?: string;
    save(): Promise<unknown>;
  };
  orderItems: {
    productId: string;
    name: string;
    model?: string;
    quantity: number;
    price: number;
  }[];
  shipping: CheckoutShipping;
  identity: CheckoutIdentity;
  account: { id: string; email: string; asaasCustomerId?: string } | null;
  guestId?: string;
};

class CreateOrderAsaasService {
  private readonly asaasBaseUrl =
    process.env.ASAAS_BASE_URL || "https://api-sandbox.asaas.com/v3";

  private isErrorResponse(
    response: AsaasCheckoutSessionResponse
  ): response is AsaasErrorResponse {
    return "errors" in response;
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

  async execute(input: CheckoutInput) {
    if (
      typeof input.paymentMethod !== "string" ||
      !input.paymentMethod.trim()
    ) {
      return {
        success: false as const,
        message: "Dados incompletos para criar o pedido.",
        guestId:
          input.shopper.kind === "guest" ? input.shopper.guestId : undefined,
      };
    }

    const prepareCheckoutService = new PrepareCheckoutService();
    const prepared = await prepareCheckoutService.execute({
      ...input,
      paymentMethod: this.getBillingType(input.paymentMethod),
    });

    if (!prepared.success) return prepared;
    if (!prepared.identity.cpf) {
      return {
        success: false as const,
        message: "CPF da compra é obrigatório",
        order: prepared.order,
        guestId: prepared.guestId,
      };
    }

    try {
      await this.resolveCustomer(prepared);
      const paymentResponse = await fetch(`${this.asaasBaseUrl}/checkouts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(this.checkoutBody(prepared)),
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        return {
          success: false as const,
          message: "Erro ao gerar checkout no Asaas",
          error: errorText,
          order: prepared.order,
          guestId: prepared.guestId,
        };
      }

      const payment =
        (await paymentResponse.json()) as AsaasCheckoutSessionResponse;

      if (this.isErrorResponse(payment)) {
        return {
          success: false as const,
          message: "Erro ao gerar checkout no Asaas",
          errors: payment.errors,
          order: prepared.order,
          guestId: prepared.guestId,
        };
      }

      prepared.order.checkoutUrl = payment.link;
      prepared.order.checkoutId = payment.id;
      await prepared.order.save();

      return {
        success: true as const,
        message: "Pedido criado com sucesso",
        order: prepared.order,
        checkoutUrl: payment.link,
        guestId: prepared.guestId,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false as const,
        message: "Erro no servidor",
        order: prepared.order,
        guestId: prepared.guestId,
      };
    }
  }

  private checkoutBody(prepared: PreparedSuccess) {
    const address = prepared.order.shippingAddress ?? {};
    const city =
      address.ibgeCode && /^\d+$/.test(address.ibgeCode)
        ? Number(address.ibgeCode)
        : address.ibgeCode || "";

    return {
      billingTypes: ["PIX", "CREDIT_CARD"],
      chargeTypes: ["DETACHED", "INSTALLMENT"],
      minutesToExpire: 10,
      externalReference: prepared.order._id.toString(),
      callback: {
        successUrl: "https://example.com/asaas/checkout/success",
        cancelUrl: "https://example.com/asaas/checkout/cancel",
        expiredUrl: "https://example.com/asaas/checkout/expired",
      },
      items: [
        ...prepared.orderItems.map((item) => ({
          externalReference: item.productId,
          name: item.model ? `${item.name} (${item.model})` : item.name,
          quantity: item.quantity,
          value: item.price,
          description: item.model ?? item.name,
        })),
        {
          externalReference: prepared.shipping.serviceId,
          name: prepared.shipping.serviceName || "Frete",
          quantity: 1,
          value: prepared.shipping.price,
          description: prepared.shipping.serviceName || "Frete",
        },
      ],
      customerData: {
        name: prepared.identity.fullName,
        cpfCnpj: prepared.identity.cpf,
        email: prepared.identity.email,
        phone: prepared.identity.phone,
        address: address.street || "",
        addressNumber: address.number || "",
        complement: address.complement || "",
        province: address.neighborhood || "",
        postalCode: address.zipCode || "",
        city,
      },
    };
  }

  private async resolveCustomer(prepared: PreparedSuccess) {
    const reuse =
      prepared.account !== null &&
      prepared.account.email === prepared.identity.email;

    if (reuse && prepared.account?.asaasCustomerId) {
      return prepared.account.asaasCustomerId;
    }

    const customerResponse = await fetch(`${this.asaasBaseUrl}/customers`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        name: prepared.identity.fullName,
        email: prepared.identity.email,
        cpfCnpj: prepared.identity.cpf,
        mobilePhone: prepared.identity.phone,
      }),
    });

    if (!customerResponse.ok) {
      const errorText = await customerResponse.text();
      throw new Error(errorText || "Erro ao criar cliente no Asaas");
    }

    const customer = (await customerResponse.json()) as AsaasCustomerResponse;

    if (reuse && prepared.account) {
      await userModel.findByIdAndUpdate(prepared.account.id, {
        asaasCustomerId: customer.id,
      });
    }

    return customer.id;
  }
}

export default CreateOrderAsaasService;
