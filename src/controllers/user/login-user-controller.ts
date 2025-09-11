import { Request, Response } from 'express';
import LoginUserService from '../../services/user/login-user-service';



class LoginUserController {
    async handle(request: Request, response: Response) {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({ success: false, message: 'Email e Password são obrigatórios' });
        }

        const loginUserService = new LoginUserService();
        const resultLoginUserService = await loginUserService.execute({ email, password });

        return response.status(200).json(resultLoginUserService);

    }
}


export default LoginUserController;