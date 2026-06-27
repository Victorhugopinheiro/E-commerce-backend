import addressModel from "../../model/addressModel";
import userModel from "../../model/userModel";

interface AddressProps {
    userId: string;
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    ibgeCode?: string;

}

class AddAddressService {
    async execute({ userId, street, city, state, zipCode, country, phone, number, ibgeCode }: AddressProps) {

        const user = await userModel.findById(userId);

        if (!user) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        const addresses = await addressModel.find({ userId });

        const existingPhone = await addressModel.findOne({ phone });

        if (existingPhone) {
            return { success: false, message: 'O número de telefone já está associado a outro endereço.' };
        }

        if (addresses.length >= 4) {
            return { success: false, message: 'Limite de endereços atingido. Você pode adicionar até 4 endereços.' };
        }
        if (addresses.length === 0) {

        }





        const newAddress = {
            userId,
            street,
            number,
            city,
            state,
            zipCode,
            country,
            phone,
            ibgeCode,
            isPrimary: addresses.length === 0 ? true : false
        };

        const crateAddress = await new addressModel(newAddress);

        if (!crateAddress) {
            return { success: false, message: 'Erro ao criar o endereço.' };
        }

        await crateAddress.save();



        return { success: true, message: 'Endereço adicionado com sucesso', address: newAddress };


    }
}

export default AddAddressService;