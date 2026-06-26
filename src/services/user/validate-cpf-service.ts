
import { cpf } from 'cpf-cnpj-validator';
import UserIdentificationModel from '../../model/UserIdentification ';
import userModel from '../../model/userModel';

interface ValidateCpf {
    userCpf: string;
    firstName: string;
    secondName: string;
    userId: string;
}



class ValidateCpfService {


    async execute({ userCpf, firstName, secondName, userId }: ValidateCpf) {
        cpf.isValid(userCpf);

        if (!cpf.isValid(userCpf)) {
            throw new Error('CPF inválido.');
        }

        const findUser = await userModel.findById({ _id: userId });

        if (!findUser) {
            throw new Error('Usuário não encontrado para associar o CPF.');
        }

        const registeredCpf = await UserIdentificationModel.findOne({ cpf: userCpf });

        if (registeredCpf) {
            throw new Error('CPF já cadastrado.');
        }


        const newUserIdentification = await new UserIdentificationModel({
            userCpf: userCpf,
            firstName,
            secondName,
            userId
        });


        await newUserIdentification.save();

        return {
            success: true,
            message: 'CPF validado e cadastrado com sucesso.',
        }

    }
}

export default ValidateCpfService
