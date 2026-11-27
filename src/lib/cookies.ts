import { CookieOptions, Response } from "express";

export const AUTH_COOKIE = "authToken";
export const GUEST_COOKIE = "guestId";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/",
    domain: "localhost",
  };
}

export function authCookieOptions(): CookieOptions {
  return { ...baseCookieOptions(), maxAge: ONE_DAY_MS };
}

export function guestCookieOptions(): CookieOptions {
  return { ...baseCookieOptions(), maxAge: SEVEN_DAYS_MS };
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE, baseCookieOptions());
}

export function clearGuestCookie(res: Response) {
  res.clearCookie(GUEST_COOKIE, baseCookieOptions());
}

export function rememberGuest(res: Response, guestId: string) {
  res.cookie(GUEST_COOKIE, guestId, guestCookieOptions());
}
