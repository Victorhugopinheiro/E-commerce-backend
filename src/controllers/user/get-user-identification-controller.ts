import { Request, Response } from "express";
import GetUserIdentificationService from "../../services/user/get-user-identification-service";
interface AuthenticatedRequest extends Request {
    user?: { id: string; email: string };
}

class GetUserIdentificationController {
    async handle(req: AuthenticatedRequest, res: Response) {
        try {

            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
            }



            const responseGetUserIdentification = new GetUserIdentificationService();
            const result = await responseGetUserIdentification.execute(userId);

            return res.json({ message: "Usuário identificado", success: true, data:result }).status(200);


        } catch (error) {
            console.error('Erro ao obter identificação do usuário:', error);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        }
    }
}

export default new GetUserIdentificationController();
