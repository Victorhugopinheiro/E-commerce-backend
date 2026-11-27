import { Request, Response } from "express";
import RegisterUserService from "../../services/user/register-user-service";
import MergeGuestCartService from "../../services/cart/merge-guest-cart-service";
import {
  AUTH_COOKIE,
  authCookieOptions,
  clearGuestCookie,
} from "../../lib/cookies";

class RegisterUserController {
  async handle(req: Request, res: Response) {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
      return res.status(400).send("Missing required fields");
    }

    const authService = new RegisterUserService();
    const result = await authService.execute({
      name: username,
      email,
      password,
    });

    const formatedResult = {
      success: result.success,
      message: result.message,
      user: {
        id: result.user?.id,
        name: result.user?.name,
        email: result.user?.email,
      },
    };

    if (result.success && result.user?.token && result.user.id) {
      res.cookie(AUTH_COOKIE, result.user.token, authCookieOptions());

      const guestId =
        typeof req.cookies?.guestId === "string"
          ? req.cookies.guestId
          : undefined;
      const merge = await new MergeGuestCartService().execute({
        userId: String(result.user.id),
        guestId,
      });

      if (merge.clearGuestCookie) clearGuestCookie(res);
    }

    return res.status(201).json(formatedResult);
  }
}

export default RegisterUserController;
