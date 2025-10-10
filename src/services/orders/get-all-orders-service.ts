import orderModel from "../../model/orderModel";
import userModel from "../../model/userModel";


class GetAllOrdersService {
    async execute() {


        try {

      

            const orders = await orderModel.find()


            if(!orders || orders.length === 0) {
                return { success: false, message: 'Nenhum pedido encontrado' };
            }


            return {
                success: true,
                message: 'Pedidos encontrados',
                orders
            };

        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erro no servidor', err };
        }
    }
}


export default GetAllOrdersService;