import { cpf } from "cpf-cnpj-validator";
import { isEmail } from "validator";
import orderModel from "../../model/orderModel";
import purchaseIdentityModel from "../../model/purchaseIdentityModel";
import userModel from "../../model/userModel";
import { Shopper } from "../../types/shopper";
import CepValidator from "../../utils/cepValidator";
import { openGuestCart } from "../guest/guest-cart-store";
import {
  PricedOrderItem,
  priceOrderItems,
} from "../product/resolve-purchase-line";
import { quoteStoreBox } from "../shipping/quote-shipping";
import { removePurchasedLines } from "./remove-purchased-lines";

const cepValidator = new CepValidator();

export type CheckoutAccount = {
  id: string;
  email: string;
  asaasCustomerId?: string;
};

export type CheckoutIdentity = {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
};

export type CheckoutShipping = {
  serviceId: string;
  serviceName: string;
  price: number;
  deadline: number;
};

type CheckoutAddressInput = {
  street?: string;
  number?: string;
  neighborhood?: string;
  complement?: string;
  zipCode?: string;
  country?: string;
};

export type CheckoutInput = {
  shopper: Shopper;
  items?: {
    productId: string;
    quantity: number;
    size?: string;
    model?: string;
    name?: string;
  }[];
  paymentMethod?: string;
  fullName?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  shippingServiceId?: string | number;
  shippingAddress?: CheckoutAddressInput;
};

type StoredUser = {
  _id: unknown;
  email: string;
  asaasCustomerId?: string;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function fail(message: string, guestId?: string) {
  return { success: false as const, message, guestId };
}

function toAccount(user: StoredUser): CheckoutAccount {
  return {
    id: String(user._id),
    email: user.email,
    asaasCustomerId: user.asaasCustomerId,
  };
}

async function activeGuestId(shopper: Extract<Shopper, { kind: "guest" }>) {
  try {
    const opened = await openGuestCart(shopper.guestId, shopper.cookieExisted);
    return opened.guestId;
  } catch (error) {
    console.error(error);
    return shopper.guestId;
  }
}

class PrepareCheckoutService {
  async execute(input: CheckoutInput) {
    const visitorId =
      input.shopper.kind === "guest"
        ? await activeGuestId(input.shopper)
        : undefined;

    const fullName = asText(input.fullName);
    const phone = asText(input.phone);
    const cpfValue = asText(input.cpf);
    const paymentMethod = asText(input.paymentMethod);
    const serviceId = String(input.shippingServiceId ?? "").trim();
    const address = input.shippingAddress;
    const street = asText(address?.street);
    const number = asText(address?.number);
    const neighborhood = asText(address?.neighborhood);
    const zipCode = asText(address?.zipCode);
    const complement = asText(address?.complement);
    const country = asText(address?.country);

    if (!fullName || !phone || !cpfValue || !paymentMethod || !serviceId) {
      return fail("Dados incompletos para criar o pedido.", visitorId);
    }

    if (!Array.isArray(input.items) || input.items.length === 0) {
      return fail("Items são obrigatórios", visitorId);
    }

    if (!street || !number || !neighborhood || !zipCode) {
      return fail("Dados incompletos para criar o pedido.", visitorId);
    }

    if (!cpf.isValid(cpfValue)) {
      return fail("CPF inválido.", visitorId);
    }

    let email = asText(input.email);
    let account: CheckoutAccount | null = null;

    if (input.shopper.kind === "user") {
      const user = (await userModel.findById(
        input.shopper.userId
      )) as StoredUser | null;
      if (!user) return fail("Usuário não encontrado", visitorId);
      email = asText(user.email);
      account = toAccount(user);
    }

    if (!email || !isEmail(email)) {
      return fail("Email inválido", visitorId);
    }

    const cepResult = await cepValidator.validate(zipCode);
    if (!cepResult.success || !cepResult.data) {
      return fail(cepResult.error || "Erro ao validar CEP", visitorId);
    }

    const lookedUp = cepResult.data;
    if (!lookedUp.city || !lookedUp.state || !lookedUp.ibgeCode) {
      return fail("CEP não encontrado.", visitorId);
    }

    const priced = await priceOrderItems(input.items);
    if (!priced.ok) return fail(priced.message, visitorId);

    let quotes: Awaited<ReturnType<typeof quoteStoreBox>> = [];
    try {
      quotes = await quoteStoreBox(lookedUp.zipCode, priced.total);
    } catch (error) {
      console.error(error);
      quotes = [];
    }

    const selected = quotes.find((quote) => quote.serviceId === serviceId);
    if (!selected) {
      return fail("Frete indisponível para o serviço escolhido.", visitorId);
    }

    if (input.shopper.kind === "guest") {
      const existing = (await userModel.findOne({
        email,
      })) as StoredUser | null;
      if (existing) account = toAccount(existing);
    }

    const resolvedGuestId =
      input.shopper.kind === "guest"
        ? (visitorId ?? input.shopper.guestId)
        : undefined;
    const orderUserId =
      input.shopper.kind === "user" ? input.shopper.userId : account?.id;
    const orderGuestId =
      input.shopper.kind === "guest" && !account ? resolvedGuestId : undefined;
    const identityUserId =
      input.shopper.kind === "user" ? input.shopper.userId : undefined;
    const identityGuestId = resolvedGuestId;

    const shippingAddress = {
      street,
      number,
      neighborhood,
      ...(complement ? { complement } : {}),
      city: lookedUp.city,
      state: lookedUp.state,
      zipCode: lookedUp.zipCode,
      country: country || "Brasil",
      ibgeCode: lookedUp.ibgeCode,
      phone,
    };
    const shippingPrice = Math.round(selected.price * 100) / 100;
    const totalAmount = Math.round((priced.total + shippingPrice) * 100) / 100;
    const shipping: CheckoutShipping = {
      serviceId: selected.serviceId,
      serviceName: selected.serviceName,
      price: shippingPrice,
      deadline: selected.deadline,
    };

    const order = await orderModel.create({
      ...(orderUserId ? { userId: orderUserId } : {}),
      ...(orderGuestId ? { guestId: orderGuestId } : {}),
      items: priced.orderItems.map(({ name: _name, ...item }) => item),
      totalAmount,
      shippingAddress,
      shipping,
      paymentMethod,
      status: "pending",
      paymentStatus: "pending",
      date: Date.now(),
    });

    const identity: CheckoutIdentity = {
      fullName,
      email,
      cpf: cpfValue,
      phone,
    };

    try {
      await purchaseIdentityModel.create({
        orderId: order._id,
        ...(identityUserId ? { userId: identityUserId } : {}),
        ...(identityGuestId ? { guestId: identityGuestId } : {}),
        ...identity,
      });
    } catch (error) {
      await orderModel.findByIdAndDelete(order._id);
      console.error(error);
      return fail("Erro no servidor", visitorId);
    }

    try {
      if (resolvedGuestId) {
        await removePurchasedLines(
          { kind: "guest", guestId: resolvedGuestId, cookieExisted: true },
          priced.orderItems
        );
      } else if (input.shopper.kind === "user") {
        await removePurchasedLines(input.shopper, priced.orderItems);
      }
    } catch (error) {
      console.error("Falha ao limpar o carrinho depois do pedido", error);
    }

    return {
      success: true as const,
      order,
      identity,
      orderItems: priced.orderItems as PricedOrderItem[],
      shipping,
      account,
      guestId: resolvedGuestId,
    };
  }
}

export default PrepareCheckoutService;
