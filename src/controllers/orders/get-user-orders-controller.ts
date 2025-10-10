
import { Request, Response } from 'express';
import { get } from 'http';
import GetUserOrdersService from '../../services/orders/get-user-orders-service';


class GetUserOrdersController {
    async handle(req: Request, res: Response) {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Usuário não logado' });
        }

        const ordersService = new GetUserOrdersService();
        const orders = await ordersService.execute(userId);


        res.status(200).json(orders);



    }
}


export default GetUserOrdersController;