// filepath: src/types/express/index.d.ts
export interface AdminJwtPayload {
    userId: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            admin?: AdminJwtPayload;
        }
    }
}