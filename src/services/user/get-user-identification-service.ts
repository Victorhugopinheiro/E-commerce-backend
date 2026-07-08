import userIdentificationModel from '../../model/userIdentification'
import userModel from '../../model/userModel';
class GetUserIdentificationService {
    async execute(userId: string) {
        

        const user = await userModel.findById(userId)

        if (!user) {
            throw new Error('Identificação do usuário não encontrada.');
        }

        const userIdentification = await userIdentificationModel.findOne({ userId: user._id });

        if (!userIdentification) {
            throw new Error('Identificação do usuário não encontrada.');
        }

        return userIdentification;
    }
}

export default  GetUserIdentificationService
