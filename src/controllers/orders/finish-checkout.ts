import { Request, Response } from "express";
import { rememberGuest } from "../../lib/cookies";
import { Shopper } from "../../types/shopper";
import { CheckoutInput } from "../../services/orders/prepare-checkout-service";

type CheckoutResult = {
  success: boolean;
  guestId?: string;
  message?: string;
};

export function checkoutInputFromRequest(req: Request): CheckoutInput | null {
  if (!req.shopper) return null;
  const body = req.body ?? {};
  return {
    shopper: req.shopper,
    items: body.items,
    paymentMethod: body.paymentMethod,
    fullName: body.fullName,
    email: body.email,
    cpf: body.cpf,
    phone: body.phone,
    shippingServiceId: body.shippingServiceId,
    shippingAddress: body.shippingAddress,
  };
}

export function finishCheckout(
  res: Response,
  shopper: Shopper,
  result: CheckoutResult
) {
  if (shopper.kind === "guest") {
    rememberGuest(res, result.guestId || shopper.guestId);
  }

  const { guestId: _guestId, ...body } = result;
  return res.status(result.success ? 200 : 400).json(body);
}

export async function runCheckout(
  res: Response,
  shopper: Shopper,
  execute: () => Promise<CheckoutResult>
) {
  try {
    return finishCheckout(res, shopper, await execute());
  } catch (error) {
    console.error(error);
    return finishCheckout(res, shopper, {
      success: false,
      message: "Erro no servidor",
      guestId: shopper.kind === "guest" ? shopper.guestId : undefined,
    });
  }
}
