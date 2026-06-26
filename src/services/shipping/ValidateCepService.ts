


class ValidateCepService {
    async execute(cep: string) {

        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            throw new Error('CEP não encontrado.');
        }

        return {
            street: data.logradouro || '',
            city: data.localidade,
            state: data.uf,
            zipCode: cep,
            ibgeCode: data.ibge, // This is the IBGE code
        };


    }

}



export default ValidateCepService;