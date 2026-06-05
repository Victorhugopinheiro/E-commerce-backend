import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto';

interface AuthenticatedRequest extends Request {
    admin?: { userId: string; email: string };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.cookies.authToken 

    if (!authHeader) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido ou mal formatado.' });
    }

 

    try {
        const decoded = jwt.verify(authHeader, JWT_SECRET) as { userId: string; email: string };

        if (decoded.email !== process.env.ADMIN_EMAIL || decoded.userId !== process.env.ADMIN_ID) {
            return res.status(403).json({ message: 'Acesso negado. Usuário não é admin.' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};