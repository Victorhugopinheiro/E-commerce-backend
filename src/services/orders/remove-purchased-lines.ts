import userModel from "../../model/userModel";
import CartItem from "../../types/cart";
import { Shopper } from "../../types/shopper";
import { readGuestCart, writeGuestCart } from "../guest/guest-cart-store";
import { sameCartLine } from "../product/resolve-purchase-line";

type PurchasedLine = {
  productId: string;
  size?: string;
  model?: string;
};

export async function removePurchasedLines(
  shopper: Shopper,
  items: PurchasedLine[]
) {
  if (shopper.kind === "user") {
    const user = await userModel.findById(shopper.userId);
    if (!user) return;

    const cart: CartItem[] = Array.isArray(user.cartData)
      ? [...user.cartData]
      : [];
    const next = cart.filter(
      (line) => !items.some((item) => sameCartLine(line, item))
    );
    await userModel.findByIdAndUpdate(shopper.userId, { cartData: next });
    return;
  }

  const lines = await readGuestCart(shopper.guestId);
  if (lines === null) return;

  const next = lines.filter(
    (line) => !items.some((item) => sameCartLine(line, item))
  );
  await writeGuestCart(shopper.guestId, next);
}
