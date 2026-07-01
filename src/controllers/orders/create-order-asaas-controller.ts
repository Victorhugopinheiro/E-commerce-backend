import { Request, Response } from "express";
import CreateOrderAsaasService from "../../services/orders/create-order-asaas-service";


class CreateOrderAsaasController {
    async handle(req: Request, res: Response) {
        const { userId, items, shippingAddress, paymentMethod } = req.body;
        const { origin } = req.headers;

        if (!userId || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Dados incompletos para criar o pedido.' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Items são obrigatórios' });
        }

        for (const item of items) {
            if (!item.size || !item.quantity || !item.productId) {
                return res.status(400).json({ success: false, message: 'Dados incompletos para criar o pedido.' });
            }
        }

        

        const createOrderService = new CreateOrderAsaasService();
        const result = await createOrderService.execute({
            userId,
            items,
            shippingAddress,
            paymentMethod,
            origin: String(origin || '')
        });

        return res.status(result.success ? 200 : 400).json(result);
    }
}


export default CreateOrderAsaasController;