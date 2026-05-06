import userModel from "../../model/userModel";

class userDetailService {
    async execute(userId: string) {

        const user = await userModel.findById(userId)

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        return {
            userAddresses: user.addresses,
            success: true,
            message: 'Detalhes do usuário encontrados com sucesso'
        }

    }
}

export default userDetailService;