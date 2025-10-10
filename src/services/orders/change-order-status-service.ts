import orderModel from "../../model/orderModel";



class ChangeOrderStatusService {
    async execute({ orderId, status }: { orderId: string, status: string }) {

        try {

            const validStatuses = ['pending',  'shipped', 'delivered', 'refunded'];

            if (!validStatuses.includes(status)) {
                return { success: false, message: 'Status inválido' };
            }

            const updatedOrder = await orderModel.findByIdAndUpdate(
                orderId,
                { status },
                { new: true, runValidators: true }
            );
            if (!updatedOrder) return { success: false };


            return {
                success: true,
                message: 'Status atualizado com sucesso',
                order: updatedOrder
            };

        } catch (error) {
            console.error(error);
            return { success: false, message: 'Erro no servidor', error };
        }


    }
}



export default ChangeOrderStatusService;