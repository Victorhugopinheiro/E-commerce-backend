
import userIdentificationModel from "../../model/userIdentification";

class UserIdentificationService {
    async execute(userId: string) {

        const user = await userIdentificationModel.findOne({ userId });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

     

        return {
            data: {
                userCpf: user.userCpf,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            success: true,
            message: 'Identificação do usuário encontrada com sucessosss'
        }



    }
}

export default UserIdentificationService;