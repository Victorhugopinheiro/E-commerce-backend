// filepath: src/types/express/index.d.ts
import { AuthenticatedRequest } from "../../middleware/adminMiddlewere";

declare global {
    namespace Express {
        interface Request {
            admin?: AdminJwtPayload;
        }
    }
}