
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

            

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            const userAlredyHaveCpf = await userIdentificationModel.findOne({ userId });

            

            if (userAlredyHaveCpf) {
                throw new Error('Usuário já possui CPF cadastrado');
            }

            const cpfExists = await userIdentificationModel.findOne({ userCpf });

        

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
            
            throw new Error('Erro ao validar CPF');
        }


    }
}

export default ValidateCpfService;
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
