import orderModel from "../../model/orderModel";
import productModel from "../../model/productModel";
import userModel from "../../model/userModel";
import CartItem from "../../types/cart";
import { CreateOrderRequest } from "../../types/order";

class CreateOrderService {


    async execute({ items, paymentMethod, shippingAddress, userId }: CreateOrderRequest) {
        try {


            const user = await userModel.findById(userId);

            if (!user) {
                return { success: false, message: 'Usuário não encontrado' };
            }


            const orderItems = [];
            let totalAmount = 0;

            for (const item of items) {
                if (item.quantity <= 0) {
                    return { success: false, message: `Quantidade inválida para o produto ${item.productId}` };
                }

                const product = await productModel.findById(item.productId);

                if (!product) {
                    return { success: false, message: `Produto não encontrado: ${item.productId}` };
                }

                const itemTotal = product.price * item.quantity;
                totalAmount += itemTotal;

                orderItems.push({

                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size,
                    price: product.price

                });


            }

            const newOrder = new orderModel({
                userId,
                items: orderItems,
                totalAmount,
                shippingAddress,
                paymentMethod,
                status: 'pending',
                paymentStatus: 'pending',
                date: Date.now()
            })

            newOrder.save();

            const rawCart = user.cartData
            const itemsCart = Array.isArray(rawCart) ? [...rawCart] : [];

            for (const item of items) {
                const cartItemIndex = itemsCart.findIndex(cartItem => cartItem.productId === item.productId && cartItem.size === item.size);
                if (cartItemIndex !== -1) {
                    user.cartData.splice(cartItemIndex, 1);
                }
            }

            return { success: true, message: 'Pedido criado com sucesso', order: newOrder };



        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erro no servidor', err };
        }
    }
}



export default CreateOrderService;