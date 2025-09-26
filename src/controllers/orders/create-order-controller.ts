import { Request, Response } from "express";


class CreateOrderController {
    async handle(req: Request, res: Response) {

        const { userId, items, shippingAddress, paymentMethod } = req.body;

        if (!userId || items.length === 0 || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Dados incompletos para criar o pedido.' });
        }


        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Items são obrigatórios' });
        }








    }

}