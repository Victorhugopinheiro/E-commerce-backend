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

}

class AddAddressService {
    async execute({ userId, street, city, state, zipCode, country, phone, number }: AddressProps) {

        const user = await userModel.findById(userId);

        if (!user) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        if (user.addresses.length >= 5) {
            return { success: false, message: 'Limite de endereços atingido. Você pode adicionar até 5 endereços.' };
        }

        const newAddress = {
            userId,
            street,
            number,
            city,
            state,
            zipCode,
            country,
            phone
        };

        const crateAddress = new addressModel(newAddress);

        await crateAddress.save();

        const updatedUser = await userModel.findByIdAndUpdate(userId, { $push: { addresses: newAddress } }, { new: true });

        if (!updatedUser) {
            return { success: false, message: 'Erro ao adicionar endereço' };
        }

        console.log('Endereço adicionado:', newAddress);

        return { success: true, message: 'Endereço adicionado com sucesso', address: newAddress };


    }
}

export default AddAddressService;