import productModel from "../../model/productModel";
import userModel from "../../model/userModel";




class GetAllItemsCartService {
    async execute({ userId }: { userId: string }) {


        const user = await userModel.findById(userId);

        if (!user) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        const rawCart = user.cartData;
        const userCart = Array.isArray(rawCart) ? [...rawCart] : [];


        for (let item of userCart) {
            const productId = item.productId;

            const findProduct = await productModel.findById(productId);
            if (!findProduct) {
                const deleteItemIndex = userCart.findIndex(i => i.productId === productId);
                if (deleteItemIndex > -1) {
                    userCart.splice(deleteItemIndex, 1);
                    await userModel.findByIdAndUpdate(userId, { cartData: userCart });
                }

            }



        }

        return { success: true, cart: userCart };
    }

}

export default GetAllItemsCartService;