import userModel from "../../model/userModel";
import ProductModel from "../../model/productModel";
import CartItem from "../../types/cart";
import { Shopper } from "../../types/shopper";
import {
  GuestCartUnavailableError,
  openGuestCart,
  writeGuestCart,
} from "../guest/guest-cart-store";
import {
  resolvePurchaseLine,
  sameCartLine,
} from "../product/resolve-purchase-line";

interface AddProductToCartProps {
  shopper: Shopper;
  productId: string;
  quantity: number;
  size?: string;
  model?: string;
  name?: string;
}

type CartResult = {
  success: boolean;
  message: string;
  cart?: unknown;
  unavailable?: boolean;
  guestId?: string;
  err?: unknown;
};

type LineInput = {
  productId: string;
  size?: string;
  model?: string;
  name?: string;
};

class AddProductToCartService {
  async execute({
    shopper,
    productId,
    size,
    model,
    name,
  }: AddProductToCartProps): Promise<CartResult> {
    try {
      if (shopper.kind === "guest") {
        return await this.addForGuest({
          shopper,
          productId,
          size,
          model,
          name,
        });
      }

      if (!shopper.userId) {
        return { success: false, message: "Usuário não encontrado" };
      }

      const user = await userModel.findById(shopper.userId);
      if (!user) {
        return { success: false, message: "Usuário não encontrado" };
      }

      const product = await ProductModel.findById(productId);
      if (!product) {
        return { success: false, message: "Produto não encontrado" };
      }

      const resolved = resolvePurchaseLine(product, { size, model });
      if (!resolved.ok) {
        return { success: false, message: resolved.message };
      }

      const lines: CartItem[] = Array.isArray(user.cartData)
        ? [...user.cartData]
        : [];
      const cart = addLine(lines, {
        productId,
        size: resolved.line.size,
        model: resolved.line.model,
        name,
      });

      const updated = await userModel.findByIdAndUpdate(
        shopper.userId,
        { cartData: cart },
        { new: true }
      );

      if (!updated) {
        return {
          success: false,
          message: "Erro ao adicionar produto ao carrinho",
        };
      }

      return {
        success: true,
        message: "Produto adicionado ao carrinho com sucesso",
        cart: updated.cartData,
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Erro no servidor", err };
    }
  }

  private async addForGuest({
    shopper,
    productId,
    size,
    model,
    name,
  }: {
    shopper: Extract<Shopper, { kind: "guest" }>;
    productId: string;
    size?: string;
    model?: string;
    name?: string;
  }): Promise<CartResult> {
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

      const resolved = resolvePurchaseLine(product, { size, model });
      if (!resolved.ok) {
        return {
          success: false,
          message: resolved.message,
          guestId: opened.guestId,
        };
      }

      const cart = addLine(opened.lines, {
        productId,
        size: resolved.line.size,
        model: resolved.line.model,
        name,
      });

      await writeGuestCart(opened.guestId, cart);

      return {
        success: true,
        message: "Produto adicionado ao carrinho com sucesso",
        cart,
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

function addLine(lines: CartItem[], input: LineInput) {
  const cart = [...lines];
  const index = cart.findIndex((item) =>
    sameCartLine(item, {
      productId: input.productId,
      size: input.size,
      model: input.model,
    })
  );

  if (index === -1) {
    cart.push({
      productId: input.productId,
      quantity: 1,
      size: input.size,
      model: input.model,
      name: input.name,
    });
    return cart;
  }

  const stored = Number(cart[index].quantity);
  cart[index] = {
    ...cart[index],
    quantity: Number.isFinite(stored) ? stored + 1 : 1,
  };
  return cart;
}

export default AddProductToCartService;
