import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel";

interface AuthenticatedRequest extends Request {
    user?: { id: string; email: string };
}

export const authCartMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    const authCart = req.headers.authorization;


    if (!authCart || !authCart.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido ou mal formatado.' });
    }


    const token = authCart.split(' ')[1];

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        req.body.userId = decoded.id;
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }

}