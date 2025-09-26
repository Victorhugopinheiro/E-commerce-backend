import userModel from "../../model/userModel";
import ProductModel from "../../model/productModel";
import CartItem from "../../types/cart";

interface RemoveProps {
    userId: string;
    productId: string;
    size?: string;
}

class RemoveProductCartService {
    async execute({ productId, userId, size }: RemoveProps) {

        try {

            const user = await userModel.findById(userId);

            if (!user) {
                return { success: false, message: 'Usuário não encontrado' };
            }

            const product = await ProductModel.findById(productId);

            if (!product) {
                return { success: false, message: 'Produto não encontrado' };
            }

            const rawCart = user.cartData;
            const userCart: CartItem[] = Array.isArray(rawCart) ? [...rawCart] : [];
            const productIndex = userCart.findIndex(item => item.productId === productId && item.size === size);

            if (productIndex !== -1) {
                if (userCart[productIndex].quantity > 1) {
                    userCart[productIndex].quantity = Number(userCart[productIndex].quantity - 1);
                    const updatedCart = await userModel.findByIdAndUpdate(userId, { cartData: userCart }, { new: true });
                }
                else {
                    userCart[productIndex].quantity = 0;
                    userCart.splice(productIndex, 1);
                    const updatedCart = await userModel.findByIdAndUpdate(userId, { cartData: userCart }, { new: true });


                }

                return { success: true, message: 'Produto removido do carrinho com sucesso', cart: userCart };
            } else {
                return { success: false, message: 'Produto não encontrado no carrinho' };
            }






        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erro no servidor', err };
        }

    }
}


export default RemoveProductCartService;