import userModel from "../../model/userModel";
import ProductModel from "../../model/productModel";
import CartItem from "../../types/cart";
import { Shopper } from "../../types/shopper";
import {
  GuestCartUnavailableError,
  openGuestCart,
  writeGuestCart,
} from "../guest/guest-cart-store";
import { sameCartLine } from "../product/resolve-purchase-line";

interface RemoveProps {
  shopper: Shopper;
  productId: string;
  size?: string;
  model?: string;
}

class RemoveProductCartService {
  async execute({ productId, shopper, size, model }: RemoveProps) {
    try {
      if (shopper.kind === "guest") {
        return await this.removeForGuest({ shopper, productId, size, model });
      }

      const user = await userModel.findById(shopper.userId);

      if (!user) {
        return { success: false, message: "Usuário não encontrado" };
      }

      const product = await ProductModel.findById(productId);

      if (!product) {
        return { success: false, message: "Produto não encontrado" };
      }

      const rawCart = user.cartData;
      const userCart: CartItem[] = Array.isArray(rawCart) ? [...rawCart] : [];
      const removed = removeOne(userCart, { productId, size, model });

      if (!removed.found) {
        return {
          success: false,
          message: "Produto não encontrado no carrinho",
        };
      }

      await userModel.findByIdAndUpdate(
        shopper.userId,
        { cartData: removed.cart },
        { new: true }
      );

      return {
        success: true,
        message: "Produto removido do carrinho com sucesso",
        cart: removed.cart,
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Erro no servidor", err };
    }
  }

  private async removeForGuest({
    shopper,
    productId,
    size,
    model,
  }: {
    shopper: Extract<Shopper, { kind: "guest" }>;
    productId: string;
    size?: string;
    model?: string;
  }) {
    try {
      const opened = await openGuestCart(
        shopper.guestId,
        shopper.cookieExisted
      );
      const product = await ProductModel.findById(productId);

      if (!product) {
        return {
          success: false,
          message: "Produto não encontrado",
          guestId: opened.guestId,
        };
      }

      const removed = removeOne(opened.lines, { productId, size, model });
      if (!removed.found) {
        return {
          success: false,
          message: "Produto não encontrado no carrinho",
          guestId: opened.guestId,
        };
      }

      await writeGuestCart(opened.guestId, removed.cart);

      return {
        success: true,
        message: "Produto removido do carrinho com sucesso",
        cart: removed.cart,
        guestId: opened.guestId,
      };
    } catch (err) {
      if (err instanceof GuestCartUnavailableError) {
        return {
          success: false,
          unavailable: true,
          message: err.message,
        };
      }
      console.error(err);
      return { success: false, message: "Erro no servidor", err };
    }
  }
}

function removeOne(
  lines: CartItem[],
  target: { productId: string; size?: string; model?: string }
) {
  const userCart = [...lines];
  const productIndex = userCart.findIndex((item) => sameCartLine(item, target));

  if (productIndex === -1) {
    return { found: false, cart: userCart };
  }

  if (Number(userCart[productIndex].quantity) > 1) {
    userCart[productIndex] = {
      ...userCart[productIndex],
      quantity: Number(userCart[productIndex].quantity) - 1,
    };
  } else {
    userCart.splice(productIndex, 1);
  }

  return { found: true, cart: userCart };
}

export default RemoveProductCartService;
