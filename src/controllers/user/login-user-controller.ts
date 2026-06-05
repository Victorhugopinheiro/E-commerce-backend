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

        const formatedResult = {
            success: resultLoginUserService.success,
            message: resultLoginUserService.message,
        }

        response.cookie('authToken', resultLoginUserService.token, {
            httpOnly: true,        // JS cannot access (XSS protection)
            secure: false,         // Set to true in production (HTTPS only)
            sameSite: 'strict',       // CSRF protection
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: '/',             // Available on all routes
            domain: 'localhost'    // Change in production
        });
       

        return response.status(200).json(formatedResult);

    }
}


export default LoginUserController;