

import { Request, Response } from "express";
import ChangePrimaryAddressService from "../../services/adress/changePrimaryAddressService";

interface AuthenticatedRequest extends Request {
    user?: { id: string; email: string };
}


class ChangePrimaryAddressController {
    async handle(req: AuthenticatedRequest, res: Response) {

        const { addressId } = req.params;
        try {
            const userId = req.user?.id || req.body.userId;

            if (!userId || !addressId) {
                return res.status(400).json({ success: false, message: 'User ID and Address ID are required.' });
            }


            const primarryAddressService = new ChangePrimaryAddressService();
            const result = await primarryAddressService.execute(addressId, userId);

            res.status(200).json({ success: true, message: "Primary address changed successfully.", data: result });

        } catch (error) {
            console.error("Error changing primary address:", error);
            res.status(500).json({ success: false, message: "An error occurred while changing the primary address." });
        }



    }
}


export default ChangePrimaryAddressController;