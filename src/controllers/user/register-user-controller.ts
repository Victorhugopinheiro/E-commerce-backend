import { Request, Response } from "express";
import RegisterUserService from "../../services/user/register-user-service";



class RegisterUserController {
    async handle(req: Request, res: Response) {
        // Lógica para registrar um usuário

        const { username, email, password } = req.body;

        if (!username || !password || !email) {
            return res.status(400).send('Missing required fields');
        }


        const authService = new RegisterUserService();


        const result = await authService.execute({ name: username, email, password });
        

        return res.status(201).json(result);
    }
}

export default RegisterUserController;