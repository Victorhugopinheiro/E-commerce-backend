import { Request, Response } from 'express';
import ValidateCpfService from '../../services/user/validate-cpf-service';

class ValidateCpfController {
    async handle(req: Request, res: Response) {
        const { userCpf, firstName, lastName } = req.body
        const userId = req.body.userId

        if (!userId || !userCpf || !firstName || !lastName) {
            return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
        }

        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;

        if (!cpfRegex.test(userCpf)) {
            return res.status(400).json({ success: false, message: 'CPF inválido' });
        }

        console.log('userId:', userId, 'userCpf:', userCpf, 'firstName:', firstName, 'lastName:', lastName);

        try {
            const validateCpfService = new ValidateCpfService()
            const response = await validateCpfService.execute({ userCpf, firstName, lastName, userId });

            return res.status(200).json(response);


        } catch (error) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }


    }
}

export default ValidateCpfController;