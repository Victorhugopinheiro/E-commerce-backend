import { Request, Response } from "express";
import ValidateCpfService from "../../services/user/validate-cpf-service";

class ValidateCpfController {
    async handle(req: Request, res: Response) {
        try {
            const { userCpf, firstName,  lastName } = req.body;
            const userId = req.body.userId;
            if (!userCpf) {
                return res.status(400).json({ success: false, message: 'CPF é obrigatório.' });
            }

          
            const cpfRegex = /^\d{11}$/;
            if (!cpfRegex.test(userCpf)) {
                return res.status(400).json({ success: false, message: 'CPF deve conter exatamente 11 dígitos numéricos.' });
            }

            const serviceValidateCpf = new ValidateCpfService()
            const result = await serviceValidateCpf.execute({ userCpf, firstName, lastName, userId });

           return res.json(result).status(result.success ? 200 : 400);

        } catch (error) {
            console.error('Erro ao validar CPF:', error);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        }
    }
}

export default new ValidateCpfController();
