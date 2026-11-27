import Redis from "ioredis";

export class GuestCartUnavailableError extends Error {
  constructor() {
    super("Carrinho do visitante indisponível");
    this.name = "GuestCartUnavailableError";
  }
}

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new GuestCartUnavailableError();
  }

  const redis = new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
  });

  redis.on("error", () => {
    // The failed command rejects. This listener keeps the process alive.
  });

  client = redis;
  return redis;
}
