
import { Request, Response } from 'express';
import ValidateCepService from '../../services/shipping/ValidateCepService';


class ValidateCepController {
    async handle(req: Request, res: Response) {
        try {

            const { cep } = req.body

            if (!cep) {
                return res.status(400).json({ success: false, message: 'CEP é obrigatório' });
            }

            const cepRegex = /^\d{5}-?\d{3}$/;
            if (!cepRegex.test(cep)) {
                return res.status(400).json({ success: false, message: 'CEP inválido. O formato deve ser XXXXX-XXX ou XXXXXXXX.' });
            }

            const validateCepService = new ValidateCepService()
            const response = await validateCepService.execute(cep);

            return res.status(200).json({success:true, message: 'CEP válido', data: response});

        } catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao validar o CEP',  });
        }


    }

}

export default ValidateCepController;