import userModel from "../../model/userModel";
import CartItem from "../../types/cart";
import ProductModel from "../../model/productModel";
interface AddProductToCartProps {
    userId: string;
    productId: string;
    quantity: number;
    size?: string;
}



class AddProductToCartService {
    async execute({ productId, quantity, userId, size }: AddProductToCartProps) {


        try {
            if (!productId || !quantity || !userId || userId === '' || size === '') {
                return { success: false, message: 'Produto não identificado' };
            }

            const user = await userModel.findById(userId);

            if (!user) {
                return { success: false, message: 'Usuário não encontrado' };
            }

            const productExists = await ProductModel.findById(productId);

            if (!productExists) {
                return { success: false, message: 'Produto não encontrado' };
            }


            const rawCart = user.cartData;
            const userCart: CartItem[] = Array.isArray(rawCart) ? [...rawCart] : [];

            const productIndex = userCart.findIndex(item => item.productId === productId && item.size === size);


            if (productIndex !== -1) {
                userCart[productIndex].quantity = Number(userCart[productIndex].quantity + 1);
            } else {
                userCart.push({ productId, quantity, size });
            }

            const addedProduct = await userModel.findByIdAndUpdate(userId, { cartData: userCart }, { new: true });

            if (!addedProduct) {
                return { success: false, message: 'Erro ao adicionar produto ao carrinho' };
            }

            return { success: true, message: 'Produto adicionado ao carrinho com sucesso', cart: addedProduct.cartData };




        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erro no servidor', err };
        }

    }
}

export default AddProductToCartService;