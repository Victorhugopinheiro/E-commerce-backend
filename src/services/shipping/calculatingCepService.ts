class CalculatingCepService {
    async execute(destinationCep: string, packageData: {
        weight: number;
        height: number;
        width: number;
        length: number;
        value: number;
    }) {
        if (!process.env.MELHOR_ENVIO_API_TOKEN) {
            throw new Error('MELHOR_ENVIO_API_TOKEN não configurado');
        }

        if (!process.env.STORE_POSTAL_CODE) {
            throw new Error('STORE_POSTAL_CODE não configurado');
        }

        const payload = {
            from: {
                postal_code: process.env.STORE_POSTAL_CODE.replace('-', '')
            },
            to: {
                postal_code: destinationCep.replace('-', '')
            },
            products: [{
                id: 1,
                width: packageData.width,
                height: packageData.height,
                length: packageData.length,
                weight: packageData.weight,
                quantity: 1,
                value: packageData.value
            }]
        };

        const response = await fetch(
            'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.MELHOR_ENVIO_API_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (response.status !== 200) {
            const error = await response.json();
            throw new Error(`Erro ao calcular frete: ${error.message || response.statusText}`);
        }

        const data = await response.json();
        return data;
    }
}

export default CalculatingCepService;