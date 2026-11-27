import { Response } from "express";
import { rememberGuest } from "../../lib/cookies";
import { Shopper } from "../../types/shopper";

type CartResult = {
  success: boolean;
  message?: string;
  cart?: unknown;
  unavailable?: boolean;
  guestId?: string;
  err?: unknown;
};

export function respondCart(
  res: Response,
  shopper: Shopper,
  result: CartResult
) {
  if (shopper.kind === "guest" && !result.unavailable) {
    rememberGuest(res, result.guestId || shopper.guestId);
  }

  if (result.unavailable) {
    return res.status(503).json({
      success: false,
      message: result.message || "Carrinho do visitante indisponível",
    });
  }

  const { guestId: _guestId, unavailable: _unavailable, ...body } = result;
  return res.status(200).json(body);
}
