import orderModel from "../../model/orderModel";
import userModel from "../../model/userModel";
import CartItem from "../../types/cart";
import { CreateOrderRequest } from "../../types/order";
import {
  priceOrderItems,
  sameCartLine,
} from "../product/resolve-purchase-line";

class CreateOrderService {
  async execute({
    items,
    paymentMethod,
    shippingAddress,
    userId,
  }: CreateOrderRequest) {
    try {
      const user = await userModel.findById(userId);

      if (!user) {
        return { success: false, message: "Usuário não encontrado" };
      }

      const priced = await priceOrderItems(items);
      if (!priced.ok) {
        return { success: false, message: priced.message };
      }

      const orderItems = priced.orderItems.map(
        ({ name: _name, ...item }) => item
      );
      const totalAmount = priced.total;

      const newOrder = new orderModel({
        userId,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod,
        status: "pending",
        paymentStatus: "pending",
        date: Date.now(),
      });

      await newOrder.save();

      const rawCart = user.cartData;
      const itemsCart: CartItem[] = Array.isArray(rawCart) ? [...rawCart] : [];

      for (const item of priced.orderItems) {
        const cartItemIndex = itemsCart.findIndex((cartItem) =>
          sameCartLine(cartItem, item)
        );
        if (cartItemIndex !== -1) {
          itemsCart.splice(cartItemIndex, 1);
        }
      }

      await userModel.findByIdAndUpdate(userId, { cartData: itemsCart });

      return {
        success: true,
        message: "Pedido criado com sucesso",
        order: newOrder,
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Erro no servidor", err };
    }
  }
}

export default CreateOrderService;
