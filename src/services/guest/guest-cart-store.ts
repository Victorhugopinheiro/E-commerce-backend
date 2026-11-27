import { randomUUID } from "crypto";
import { getRedis, GuestCartUnavailableError } from "../../config/redis";
import CartItem from "../../types/cart";

export { GuestCartUnavailableError };

const TTL_SECONDS = 7 * 24 * 60 * 60;

function cartKey(guestId: string) {
  return `guest-cart:${guestId}`;
}

async function withRedis<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof GuestCartUnavailableError) throw error;
    throw new GuestCartUnavailableError();
  }
}

export async function readGuestCart(
  guestId: string
): Promise<CartItem[] | null> {
  return withRedis(async () => {
    const raw = await getRedis().get(cartKey(guestId));
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("lines" in parsed)) {
      throw new GuestCartUnavailableError();
    }

    const lines = (parsed as { lines?: unknown }).lines;
    if (!Array.isArray(lines)) throw new GuestCartUnavailableError();
    return lines as CartItem[];
  });
}

export async function writeGuestCart(guestId: string, lines: CartItem[]) {
  await withRedis(async () => {
    await getRedis().setex(
      cartKey(guestId),
      TTL_SECONDS,
      JSON.stringify({ lines })
    );
  });
}

export async function refreshGuestCart(guestId: string) {
  await withRedis(async () => {
    await getRedis().expire(cartKey(guestId), TTL_SECONDS);
  });
}

export async function deleteGuestCart(guestId: string) {
  await withRedis(async () => {
    await getRedis().del(cartKey(guestId));
  });
}

export async function openGuestCart(guestId: string, cookieExisted: boolean) {
  const lines = await readGuestCart(guestId);

  if (lines === null) {
    if (cookieExisted) {
      const nextId = randomUUID();
      await writeGuestCart(nextId, []);
      return { guestId: nextId, lines: [] as CartItem[] };
    }

    await writeGuestCart(guestId, []);
    return { guestId, lines: [] as CartItem[] };
  }

  await refreshGuestCart(guestId);
  return { guestId, lines };
}
