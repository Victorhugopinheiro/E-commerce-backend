import userModel from "../../model/userModel";




class GetAllItemsCartService {
    async execute({ userId }: { userId: string }) {


        const user = await userModel.findById(userId);

        if (!user) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        const rawCart = user.cartData;
        const userCart = Array.isArray(rawCart) ? [...rawCart] : [];

        return { success: true, cart: userCart };

    }
}

export default GetAllItemsCartService;