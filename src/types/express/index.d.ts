// filepath: src/types/express/index.d.ts
import type { Shopper } from "../shopper";

export interface AdminJwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
      shopper?: Shopper;
    }
  }
}
