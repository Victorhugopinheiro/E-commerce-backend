import { hash } from "crypto";
import userModel from "../../model/userModel";
import { isEmail } from "validator";
import bcrypt from 'bcrypt'; // ES Modules
import jwt from 'jsonwebtoken';


interface UserRegisterProps {
    name: string;
    email: string;
    password: string;
}

interface TokenPayload {
    id: string;
    email: string;
}

export const generateToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = '24h';

    if (!secret) {
        throw new Error('A variável de ambiente JWT_SECRET não está definida.');
    }

    // Assina o token com o payload e a chave secreta
    const token = jwt.sign(payload, secret, { expiresIn });

    return token;
};

class RegisterUserService {
    async execute({ name, email, password }: UserRegisterProps) {

        const findUser = await userModel.findOne({ email });

        if (findUser) {
            return { success: false, message: 'Usuário já existe' };
        }

        if (!isEmail(email)) {
            return { success: false, message: 'Email inválido' };
        }

        if (password.length < 8) {
            return { success: false, message: 'A senha deve ter pelo menos 8 caracteres' };
        }

        const saltPassword = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltPassword);


        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save();

        const payload: TokenPayload = {
            id: user._id,
            email: user.email,
        };

        const token = generateToken(payload);


        if(!token) {
            return { success: false, message: 'Erro ao gerar token' };
        }


        return {
            success: true, message: 'Usuário registrado com sucesso', user: {
                id: user._id,
                name: user.name,
                email: user.email,
                token
            }
        };


    }
}

export default RegisterUserService;