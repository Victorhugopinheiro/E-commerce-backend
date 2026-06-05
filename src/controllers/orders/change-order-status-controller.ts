import { Request, Response } from "express";
import ChangeOrderStatusService from "../../services/orders/change-order-status-service";


class ChangeOrderStatusController {
    async handle(req: Request, res: Response) {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
        }

        const changeStatus = new ChangeOrderStatusService();
        const result = await changeStatus.execute({ orderId, status });

        res.json(result);
    }
}


export default ChangeOrderStatusController;