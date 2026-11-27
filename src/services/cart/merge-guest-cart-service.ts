import productModel from "../../model/productModel";
import userModel from "../../model/userModel";
import CartItem from "../../types/cart";
import {
  deleteGuestCart,
  GuestCartUnavailableError,
  readGuestCart,
} from "../guest/guest-cart-store";
import {
  readModels,
  sameCartLine,
  trimToAbsent,
} from "../product/resolve-purchase-line";

type MergeReceipt = { guestId?: string; fingerprint?: string };

export function fingerprintLines(lines: CartItem[]) {
  return lines
    .map((line) =>
      [
        line.productId,
        trimToAbsent(line.size) ?? "",
        trimToAbsent(line.model) ?? "",
        String(line.quantity),
      ].join("|")
    )
    .sort()
    .join("\n");
}

async function purchasableLines(lines: CartItem[]) {
  const kept: CartItem[] = [];

  for (const line of lines) {
    const productId = typeof line?.productId === "string" ? line.productId : "";
    if (!productId) continue;

    const product = await productModel.findById(productId);
    if (!product) continue;

    const modelName = trimToAbsent(line.model);
    if (modelName) {
      const match = readModels(product.models).find(
        (model) => model.name === modelName
      );
      if (!match) continue;
    }

    const quantity = Number(line.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    kept.push({
      productId,
      quantity,
      size: trimToAbsent(line.size),
      model: modelName,
      name: typeof line.name === "string" ? line.name : undefined,
    });
  }

  return kept;
}

function mergeQuantities(rawCart: unknown, incoming: CartItem[]) {
  const cart: CartItem[] = Array.isArray(rawCart)
    ? rawCart.map((item) => ({ ...(item as CartItem) }))
    : [];

  for (const line of incoming) {
    const index = cart.findIndex((item) => sameCartLine(item, line));
    if (index === -1) {
      cart.push({ ...line });
    } else {
      cart[index] = {
        ...cart[index],
        quantity: Number(cart[index].quantity) + Number(line.quantity),
      };
    }
  }

  return cart;
}

class MergeGuestCartService {
  async execute({ userId, guestId }: { userId: string; guestId?: string }) {
    if (!guestId) return { clearGuestCookie: false };

    let stored: CartItem[] | null;
    try {
      stored = await readGuestCart(guestId);
    } catch (error) {
      if (!(error instanceof GuestCartUnavailableError)) console.error(error);
      return { clearGuestCookie: false };
    }

    if (stored === null) return { clearGuestCookie: true };

    try {
      const valid = await purchasableLines(stored);
      if (valid.length > 0) {
        const fingerprint = fingerprintLines(valid);
        const user = await userModel.findById(userId);
        const receipts: MergeReceipt[] = Array.isArray(user?.mergedGuestCarts)
          ? user.mergedGuestCarts
          : [];
        const already = receipts.some(
          (receipt) =>
            receipt.guestId === guestId && receipt.fingerprint === fingerprint
        );

        if (!already) {
          await userModel.findByIdAndUpdate(userId, {
            $set: { cartData: mergeQuantities(user?.cartData, valid) },
            $addToSet: { mergedGuestCarts: { guestId, fingerprint } },
          });
        }
      }

      await deleteGuestCart(guestId);
      return { clearGuestCookie: true };
    } catch (error) {
      console.error(error);
      return { clearGuestCookie: false };
    }
  }
}

export default MergeGuestCartService;
