import { stripe } from "../../lib/stripe";
import orderModel from "../../model/orderModel";
import productModel from "../../model/productModel";
import userModel from "../../model/userModel";
import { CreateOrderRequest } from "../../types/order";





class CreateOrderStripeService {


    async execute({ items, paymentMethod, shippingAddress, userId, origin }: CreateOrderRequest) {

        try {

            const currency = 'brl'
            const deliveryFee = 500;


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
                    price: product.price,
                    name: product.name

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




            const line_items = orderItems.map((item) => ({
                price_data: {
                    currency: currency,
                    unit_amount: item.price * 100, // Replace with correct price calculation if needed
                    product_data: {
                        name: item.name ? item.name : item.productId // Replace with actual product name if available
                    }
                },
                quantity: item.quantity
            }));

            line_items.push({
                price_data: {
                    currency: currency,
                    unit_amount: deliveryFee, // Delivery fee in cents
                    product_data: {
                        name: 'Taxa de Entrega'
                    }
                },
                quantity: 1
            });


            const session = await stripe.checkout.sessions.create({
                success_url: process.env.STRIPE_SUCCESS_URL || `http://localhost:5173/`,
                cancel_url: process.env.STRIPE_CANCEL_URL || `http://localhost:5173/`,
                payment_method_types: ['card'],
                mode: 'payment',
                line_items,
            })

            const rawCart = user.cartData
            const itemsCart = Array.isArray(rawCart) ? [...rawCart] : [];

            for (const item of items) {
                const cartItemIndex = itemsCart.findIndex(cartItem => cartItem.productId === item.productId && cartItem.size === item.size);
                if (cartItemIndex !== -1) {
                    itemsCart.splice(cartItemIndex, 1);
                }

            }
            
            const patchProduct = await userModel.findByIdAndUpdate(userId, { cartData: itemsCart }, { new: true });

            return { success: true, message: 'Pedido criado com sucesso', order: newOrder, sessionUrl: session.url };



        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erro no servidor', err };
        }

    }
}



export default CreateOrderStripeService;