
import { Request, Response } from 'express';
import UserIdentificationService from '../../services/user/user-identification-service';

interface UserIdentificationRequest extends Request {
    user?: {
        id: string;
        email: string;
    }
}


class UserIdentificationController {

    async handle(req: UserIdentificationRequest, res: Response) {

        try {

            const user = req.user?.id || req.body.userId;

            if (!user) {
                return res.status(400).json({ message: 'Usuário não autenticado.' });
            }

            const userIdentificationService = new UserIdentificationService();
            const userIdentificationResponse = await userIdentificationService.execute(user);

            return res.status(200).json(userIdentificationResponse);





        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }

    }


}

export default UserIdentificationController;