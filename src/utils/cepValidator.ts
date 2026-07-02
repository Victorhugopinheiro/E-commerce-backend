// src/utils/cepValidator.ts
import ValidateCepService from '../services/shipping/ValidateCepService';

interface ValidateCepResponse {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    ibgeCode: string;
}

interface CepValidationResult {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    ibgeCode: string;
}

class CepValidator {
    private validateCepService: ValidateCepService;

    constructor() {
        this.validateCepService = new ValidateCepService();
    }

    // Validate format
    isValidFormat(cep: string): boolean {
        const cepRegex = /^\d{5}-?\d{3}$/;
        return cepRegex.test(cep);
    }

    // Validate and fetch CEP data from API
    async validate(cep: string): Promise<{
        success: boolean;
        data?: ValidateCepResponse;
        error?: string;
    }> {
        if (!cep) {
            return { success: false, error: 'CEP é obrigatório' };
        }

        if (!this.isValidFormat(cep)) {
            return {
                success: false,
                error: 'CEP inválido. O formato deve ser XXXXX-XXX ou XXXXXXXX.'
            };
        }

        try {
            const data = await this.validateCepService.execute(cep);
            return { success: true, data: data as CepValidationResult };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao validar CEP'
            };
        }
    }
}

export default CepValidator;