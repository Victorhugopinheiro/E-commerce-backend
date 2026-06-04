import { Request, Response } from "express";


class LogoutAdmingController {

    async handle(req: Request, res: Response) {
        try {

            res.clearCookie("authToken", {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                path: '/',
                domain: 'localhost'
                  
            })

            res.status(200).json({ message: 'Usuário deslogado com sucesso.', success: true });

        }catch (err) {
            return res.status(500).json({ message: 'Erro no servidor.', err });
        }
    }
}

export default LogoutAdmingController;