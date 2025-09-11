import userModel from "../../model/userModel";
import bcrypt from 'bcrypt'; // ES Modules
import jwt from 'jsonwebtoken';
import { generateToken } from "./register-user-service";


interface LoginProps {
    email: string;
    password: string;
}

class LoginUserService {
    async execute({ email, password }: LoginProps) {

        try {



            if (!email || !password) {
                return { success: false, message: 'Email e Password são obrigatórios' };
            }

            const user = await userModel.findOne({ email });

            if (!user) {
                return { success: false, message: 'Credenciais incorretas' };
            }


            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                const token = generateToken({ id: user._id, email: user.email });

                return { success: true, message: 'Login realizado com sucesso', token };
            } else {
                return { success: false, message: 'Credenciais incorretas' };
            }


        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erro no servidor' };
        }


    }
}

export default LoginUserService;