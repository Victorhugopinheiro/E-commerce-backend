
import { Request, Response } from "express";
import AddAddressService from "../../services/adress/addAddressService";


interface AuthenticatedRequest extends Request {
    user?: { id: string; email: string };
}

class AddAddressController {
    async handle(req: AuthenticatedRequest, res: Response) {
        const { street, city, state, zipCode, country, phone } = req.body;

        const userId = req.user?.id || req.body.userId;



        if (!userId || !street || !city || !state || !zipCode || !country) {
            return res.status(400).json({ success: false, message: 'Dados incompletos para adicionar o endereço.' });
        }



        const addAddressService = new AddAddressService();
        const result = await addAddressService.execute({ userId, street, city, state, zipCode, country, phone });

        res.json(result).status(result.success ? 200 : 400);

    }
}


export default AddAddressController;