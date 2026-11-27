import orderModel from "../../model/orderModel";
import userModel from "../../model/userModel";
import { attachPurchaseIdentities } from "./attach-purchase-identity";

class GetUserOrdersService {
  async execute(userId: string) {
    const user = await userModel.findById(userId);

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    const orders = await orderModel.find({ userId: userId });

    if (!orders || orders.length === 0) {
      return {
        success: false,
        message: "Nenhum pedido encontrado para este usuário",
      };
    }

    return { success: true, orders: await attachPurchaseIdentities(orders) };
  }
}

export default GetUserOrdersService;
