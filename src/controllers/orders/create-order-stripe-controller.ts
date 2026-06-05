import { Request, Response } from "express";
import CreateOrderStripeService from "../../services/orders/create-order-stripe-service";



class CreateOrderStripeController {
    async handle(req: Request, res: Response) {


        const { userId, items, shippingAddress, paymentMethod } = req.body;

        const {origin} = req.headers

        if (!userId || items.length === 0 || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Dados incompletos para criar o pedido.' });
        }

        items.map((item: { size: string; quantity: number; productId: string; price: number }) => {
            if (!item.size || !item.quantity || !item.productId) {
                return res.status(400).json({ success: false, message: 'Dados incompletos para criar o pedido.' });
            }
        })





        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Items são obrigatórios' })
        }


        const createOrderService = new CreateOrderStripeService();
        const result = await createOrderService.execute({ userId, items, shippingAddress, paymentMethod, origin: String(origin) });


        res.status(result.success ? 200 : 400).json(result);


    }
}


export default CreateOrderStripeController;