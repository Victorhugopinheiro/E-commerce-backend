import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../../model/userModel';

class AdminUserController {
    // Controller methods for admin user management would go here

    async handle(request: Request, response: Response) {

        const { email, password } = request.body;

        const emaill = process.env.ADMIN_EMAIL
        const passwordd = process.env.ADMIN_PASSWORD

       

        if (!email || !password) {
            return response.status(400).json({ message: 'E-mail e senha são obrigatórios.' });

        }


        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return response.status(401).json({ message: 'Credenciais inválidas.' });
        }


        try {


            const user = await userModel.findOne({ email });

            if (!user) {
                return response.status(404).json({ message: 'Usuário admin não encontrado no banco de dados.' });
            }





            const token = jwt.sign({ email, userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });



            return response.status(200).json({ message: 'Usuário admin autenticado', token });

        } catch (err) {
            return response.status(500).json({ message: 'Erro no servidor.', err });
        }



    }

}


export default AdminUserController;