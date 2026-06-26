import { Request, Response } from 'express';
import CalculatingCepService from '../../services/shipping/calculatingCepService';


class CalculatingCepController {
    async handle(req: Request, res: Response) {

        try {
            const { destinationCep, width, height, length, weight, quantity, value } = req.body

            if (!destinationCep || !width || !height || !length || !weight || !quantity || !value) {
                return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
            }

            const cepRegex = /^\d{5}-?\d{3}$/;
            if (!cepRegex.test(destinationCep)) {
                return res.status(400).json({ success: false, message: 'CEP inválido. O formato deve ser XXXXX-XXX ou XXXXXXXX.' });
            }


            const calculatingCepService = new CalculatingCepService()
            const response = await calculatingCepService.execute(destinationCep, { width, height, length, weight, value });

            res.status(200).json({ success: true, message: 'Frete calculado com sucesso', data: response })

        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao calcular o frete', });
        }
    }
}


export default CalculatingCepController;