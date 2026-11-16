import productModel from "../../model/productModel";
import userModel from "../../model/userModel";
import CartItem from "../../types/cart";

class GetAllItemsCartService {
  async execute({ userId }: { userId: string }) {
    const user = await userModel.findById(userId);

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    const rawCart = user.cartData;
    const storedItems: unknown[] = Array.isArray(rawCart) ? rawCart : [];
    const kept: unknown[] = [];
    const cart: CartItem[] = [];

    for (const rawItem of storedItems) {
      if (!rawItem || typeof rawItem !== "object") {
        continue;
      }

      const productId =
        "productId" in rawItem && typeof rawItem.productId === "string"
          ? rawItem.productId
          : "";

      if (!productId) {
        continue;
      }

      const findProduct = await productModel.findById(productId);
      if (!findProduct) {
        continue;
      }

      kept.push(rawItem);

      const responseItem: CartItem = { ...(rawItem as CartItem) };
      delete responseItem.price;
      if (typeof findProduct.price === "number") {
        responseItem.price = findProduct.price;
      }
      cart.push(responseItem);
    }

    if (kept.length !== storedItems.length) {
      await userModel.findByIdAndUpdate(userId, { cartData: kept });
    }

    return { success: true, cart };
  }
}

export default GetAllItemsCartService;
