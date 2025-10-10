import { Request, Response } from 'express';
import GetAllOrdersService from '../../services/orders/get-all-orders-service';


class GetAllOrdersController {
    async handle(req: Request, res: Response) {

    

        const serviceGetAllOrders = new GetAllOrdersService();
        const responseGetAllOrders = await serviceGetAllOrders.execute();
        return res.status(200).json(responseGetAllOrders);
    }
}


export default GetAllOrdersController;