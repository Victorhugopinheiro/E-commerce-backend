import productModel from "../../model/productModel";
import CartItem from "../../types/cart";
import { readModels, trimToAbsent } from "../product/resolve-purchase-line";

export async function presentStoredLines(storedItems: unknown[]) {
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

    const responseItem: CartItem = { ...(rawItem as CartItem) };
    const modelName = trimToAbsent(responseItem.model);
    if (modelName) {
      const match = readModels(findProduct.models).find(
        (model) => model.name === modelName
      );
      if (!match) {
        continue;
      }
      responseItem.model = match.name;
      responseItem.price = match.price;
      if (match.image) responseItem.image = match.image;
    } else {
      delete responseItem.price;
      if (typeof findProduct.price === "number") {
        responseItem.price = findProduct.price;
      }
    }

    kept.push(rawItem);
    cart.push(responseItem);
  }

  return { kept, cart };
}
