
import { Request, Response } from "express";
import AddAddressService from "../../services/address/addAddressService";
import CepValidator from "../../utils/cepValidator";

interface AuthenticatedRequest extends Request {
    user?: { id: string; email: string };
}

class AddAddressController {

    private cepValidator: CepValidator;

    constructor(cepValidator?: CepValidator) {
        this.cepValidator = cepValidator || new CepValidator();
    }


    handle = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { street, city, state, zipCode, country, phone, number } = req.body;

            const userId = req.user?.id || req.body.userId;



            if (!userId || !street || !city || !state || !zipCode || !country || !phone || !number) {
                return res.status(400).json({ success: false, message: 'Dados incompletos para adicionar o endereço.' });
            }
            const cepValidationResult = await this.cepValidator.validate(zipCode);
            if (!cepValidationResult.success) {
                return res.status(400).json({ success: false, message: `CEP inválido: ${cepValidationResult.error}` });
            }



            const addAddressService = new AddAddressService();
            const result = await addAddressService.execute({ userId, street, number, city, state, zipCode, country, phone, ibgeCode: cepValidationResult.data?.ibgeCode });
            console.log("Add Address Service Result:", result);
            res.json(result).status(result.success ? 200 : 400);

        } catch (error) {
            console.error('Erro ao adicionar endereço:', error);
            return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        }

    }
}


export default AddAddressController;