import { Request, Response } from "express";
import LoginUserService from "../../services/user/login-user-service";
import MergeGuestCartService from "../../services/cart/merge-guest-cart-service";
import {
  AUTH_COOKIE,
  authCookieOptions,
  clearGuestCookie,
} from "../../lib/cookies";

class LoginUserController {
  async handle(request: Request, response: Response) {
    const { email, password } = request.body;

    if (!email || !password) {
      return response
        .status(400)
        .json({ success: false, message: "Email e Password são obrigatórios" });
    }

    const loginUserService = new LoginUserService();
    const resultLoginUserService = await loginUserService.execute({
      email,
      password,
    });

    if (!resultLoginUserService.success) {
      return response.status(200).json({
        success: false,
        message: resultLoginUserService.message,
      });
    }

    response.cookie(
      AUTH_COOKIE,
      resultLoginUserService.token,
      authCookieOptions()
    );

    const guestId =
      typeof request.cookies?.guestId === "string"
        ? request.cookies.guestId
        : undefined;
    const merge = await new MergeGuestCartService().execute({
      userId: resultLoginUserService.userId,
      guestId,
    });

    if (merge.clearGuestCookie) clearGuestCookie(response);

    return response.status(200).json({
      success: true,
      message: resultLoginUserService.message,
    });
  }
}

export default LoginUserController;
