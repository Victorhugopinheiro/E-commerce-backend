import userModel from "../../model/userModel";
import CartItem from "../../types/cart";
import ProductModel from "../../model/productModel";
import {
  resolvePurchaseLine,
  sameCartLine,
} from "../product/resolve-purchase-line";
interface AddProductToCartProps {
  userId: string;
  productId: string;
  quantity: number;
  size?: string;
  model?: string;
  name?: string;
}

class AddProductToCartService {
  async execute({
    productId,
    quantity,
    userId,
    size,
    model,
    name,
  }: AddProductToCartProps) {
    try {
      if (!productId || !quantity || !userId || userId === "") {
        return { success: false, message: "Produto não identificado" };
      }

      const user = await userModel.findById(userId);

      if (!user) {
        return { success: false, message: "Usuário não encontrado" };
      }

      const productExists = await ProductModel.findById(productId);

      if (!productExists) {
        return { success: false, message: "Produto não encontrado" };
      }

      const resolved = resolvePurchaseLine(productExists, { size, model });
      if (!resolved.ok) {
        return { success: false, message: resolved.message };
      }

      const rawCart = user.cartData;
      const userCart: CartItem[] = Array.isArray(rawCart) ? [...rawCart] : [];

      const productIndex = userCart.findIndex((item) =>
        sameCartLine(item, {
          productId,
          size: resolved.line.size,
          model: resolved.line.model,
        })
      );

      if (productIndex !== -1) {
        userCart[productIndex].quantity = Number(
          userCart[productIndex].quantity + 1
        );
      } else {
        userCart.push({
          productId,
          quantity,
          size: resolved.line.size,
          model: resolved.line.model,
          name,
        });
      }

      const addedProduct = await userModel.findByIdAndUpdate(
        userId,
        { cartData: userCart },
        { new: true }
      );

      if (!addedProduct) {
        return {
          success: false,
          message: "Erro ao adicionar produto ao carrinho",
        };
      }

      return {
        success: true,
        message: "Produto adicionado ao carrinho com sucesso",
        cart: addedProduct.cartData,
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Erro no servidor", err };
    }
  }
}

export default AddProductToCartService;
