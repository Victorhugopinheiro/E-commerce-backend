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



        const formatedResult = {
            success: result.success,
            message: result.message,
            user: {
                id: result.user?.id,
                name: result.user?.name,
                email: result.user?.email,
            }
        }


        res.cookie("authToken", result.user?.token, {
            httpOnly: true,        // JS cannot access (XSS protection)
            secure: false,         // Set to true in production (HTTPS only)
            sameSite: 'strict',       // CSRF protection
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            path: '/',             // Available on all routes
            domain: 'localhost'    // Change in production
        })

        return res.status(201).json(formatedResult);
    }
}

export default RegisterUserController;