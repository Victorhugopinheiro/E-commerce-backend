


class ValidateCepService {
    async execute(cep: string) {

        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            throw new Error('CEP não encontrado.');
        }

        return data


    }

}



export default ValidateCepService;