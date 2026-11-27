export type Shopper =
  | { kind: "user"; userId: string; email: string }
  | { kind: "guest"; guestId: string; cookieExisted: boolean };
