
import { Request, Response } from 'express';
import AdminDetailService from '../../services/user/admin-detail-service';


class AdminDetailController {

    readonly adminDetailServicee = new AdminDetailService();


    handle = async (req: Request, res: Response) => {

        const userId = req.admin?.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID not found in admin request' });
        }


        try {

            const adminDetailService = await this.adminDetailServicee.execute(userId);

            return res.status(200).json({ success: true });


        } catch (error) {
            return res.status(500).json({ error: error });
        }






    }

}


export default AdminDetailController;