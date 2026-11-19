import { stripe } from "../../lib/stripe";
import orderModel from "../../model/orderModel";
import userModel from "../../model/userModel";
import CartItem from "../../types/cart";
import { CreateOrderRequest } from "../../types/order";
import {
  priceOrderItems,
  sameCartLine,
} from "../product/resolve-purchase-line";

class CreateOrderStripeService {
  async execute({
    items,
    paymentMethod,
    shippingAddress,
    userId,
    origin,
  }: CreateOrderRequest) {
    try {
      const currency = "brl";
      const deliveryFee = 500;

      const user = await userModel.findById(userId);

      if (!user) {
        return { success: false, message: "Usuário não encontrado" };
      }

      let customerId = user.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
        });

        const changeUSer = await userModel.findByIdAndUpdate(
          userId,
          { stripeCustomerId: customer.id },
          { new: true }
        );

        customerId = customer.id;
      }

      const priced = await priceOrderItems(items);
      if (!priced.ok) {
        return { success: false, message: priced.message };
      }

      const orderItems = priced.orderItems;
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

      const line_items = orderItems.map((item) => ({
        price_data: {
          currency: currency,
          unit_amount: item.price * 100, // Replace with correct price calculation if needed
          product_data: {
            name: item.name ? item.name : item.productId, // Replace with actual product name if available
          },
        },
        quantity: item.quantity,
      }));

      line_items.push({
        price_data: {
          currency: currency,
          unit_amount: deliveryFee, // Delivery fee in cents
          product_data: {
            name: "Taxa de Entrega",
          },
        },
        quantity: 1,
      });

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        success_url: process.env.STRIPE_SUCCESS_URL || `http://localhost:5173/`,
        cancel_url: process.env.STRIPE_CANCEL_URL || `http://localhost:5173/`,
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        metadata: {
          orderId: newOrder._id.toString(),
        },
      });

      const rawCart = user.cartData;
      const itemsCart: CartItem[] = Array.isArray(rawCart) ? [...rawCart] : [];

      for (const item of orderItems) {
        const cartItemIndex = itemsCart.findIndex((cartItem) =>
          sameCartLine(cartItem, item)
        );
        if (cartItemIndex !== -1) {
          itemsCart.splice(cartItemIndex, 1);
        }
      }

      const patchProduct = await userModel.findByIdAndUpdate(
        userId,
        { cartData: itemsCart },
        { new: true }
      );

      return {
        success: true,
        message: "Pedido criado com sucesso",
        order: newOrder,
        sessionUrl: session.url,
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Erro no servidor", err };
    }
  }
}

export default CreateOrderStripeService;
