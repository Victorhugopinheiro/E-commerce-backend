
import userIdentificationModel from "../../model/userIdentification";
import userModel from "../../model/userModel";

interface ValidateCpfTypes {
    userCpf: string,
    firstName: string,
    lastName: string
    userId?: string
}

class ValidateCpfService {


    async execute({ userCpf, firstName, lastName, userId }: ValidateCpfTypes) {


        try {
            const user = await userModel.findById(userId)

            console.log('user:', user);

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            const userAlredyHaveCpf = await userIdentificationModel.findOne({ userId });

            console.log('userAlredyHaveCpf:', userAlredyHaveCpf);

            if (userAlredyHaveCpf) {
                throw new Error('Usuário já possui CPF cadastrado');
            }

            const cpfExists = await userIdentificationModel.findOne({ userCpf });

            console.log('cpfExists:', cpfExists);

            if (cpfExists) {
                throw new Error('CPF já cadastrado');
            }

            const createUserIdentification = await userIdentificationModel.create({
                userCpf,
                firstName,
                lastName,
                userId
            })

            if (!createUserIdentification) {
                throw new Error('Erro ao criar identificação do usuário');
            }

            createUserIdentification.save()

            return {
                success: true,
                message: 'CPF válido',
                data: {
                    userCpf,
                    firstName,
                    lastName,
                    userId
                }
            };

        } catch (error) {
            console.error(error);
            throw new Error('Erro ao validar CPF');
        }


    }
}

export default ValidateCpfService;