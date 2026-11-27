import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel";
import { Shopper } from "../types/shopper";

interface TokenPayload {
  id?: string;
  email?: string;
}

export const resolveBuyer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authToken = req.cookies?.authToken;

  if (authToken) {
    try {
      const decoded = jwt.verify(
        authToken,
        process.env.JWT_SECRET!
      ) as TokenPayload;

      if (!decoded.id) {
        return res.status(401).json({
          message: "Token de autenticação não fornecido ou mal formatado.",
        });
      }

      const user = await userModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado." });
      }

      const shopper: Shopper = {
        kind: "user",
        userId: String(user._id),
        email: user.email,
      };
      req.shopper = shopper;

      if (req.body && typeof req.body === "object") {
        req.body.userId = shopper.userId;
      }

      return next();
    } catch (error) {
      console.error("Erro na autenticação do token:", error);
      return res.status(401).json({ error });
    }
  }

  const incoming = req.cookies?.guestId;
  const cookieExisted = typeof incoming === "string" && incoming.length > 0;
  const guestId = cookieExisted ? incoming : randomUUID();

  req.shopper = { kind: "guest", guestId, cookieExisted };
  return next();
};
