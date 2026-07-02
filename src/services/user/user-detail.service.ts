import userModel from "../../model/userModel";
import addressModel from "../../model/addressModel";
class userDetailService {
    async execute(userId: string) {

        const user = await userModel.findById(userId)

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const addresses = await addressModel.find({ userId: user._id })

        if (!addresses) {
            throw new Error('Endereços do usuário não encontrados');
        }



        return {
            userAddresses: addresses,
            userInfo: {
                name: user.name,
                phone: user.phone
            },
            success: true,
            message: 'Detalhes do usuário encontrados com sucesso'
        }

    }
}

export default userDetailService;