
import { Request, Response } from 'express';
import userDetailService from '../../services/user/user-detail.service';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    }
}

class UserDetailController {
    async handle(request: AuthenticatedRequest, response: Response) {

        try {

            const user = request.user?.id || request.body.userId;

            if(!user){
                return response.status(400).json({ message: 'Usuário não autenticado.' });
            }

            const responseUser = new userDetailService()
            const userDetailResponse = await responseUser.execute(user);

            return response.status(200).json(userDetailResponse);


        } catch (err) {
            return response.status(500).json({ message: 'Erro no servidor.', err });
        }

    }
}

export default UserDetailController;