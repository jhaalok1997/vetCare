import { NextResponse } from "next/server";
import { createClient } from "redis";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// --- Redis Cloud Connection ---
const redis = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redis.on("error", (err) => console.error("Redis Client Error:", err));

(async () => {
  try {
    if (!redis.isOpen) await redis.connect();
  } catch (error) {
    console.error("🚨 Redis connection failed:", error);
  }
})();

// --- GET USER CHAT HISTORY ---
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const raw = await redis.get(`chat:${userId}`);
    const history: ChatMessage[] = raw ? JSON.parse(raw) : [];

    return NextResponse.json({ history });
  } catch (error) {
    console.error("❌ getUserChatHistory error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
