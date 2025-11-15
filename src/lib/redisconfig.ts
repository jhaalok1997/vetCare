import { createClient } from "redis";

// ---------- Redis Connection ----------
let redis: import("redis").RedisClientType | null = null;

export async function getRedisClient() {
  if (redis && redis.isOpen) return redis;

  redis = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });

  redis.on("error", (err) => console.error("Redis Client Error:", err));

  if (!redis.isOpen) {
    await redis.connect();
    console.log("✅ Connected to Redis Cloud");
  }

  return redis;
}
