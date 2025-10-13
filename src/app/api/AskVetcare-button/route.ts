import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { tavily } from "@tavily/core";
import { createClient } from "redis";

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

interface TavilySearchResponse {
  results: TavilySearchResult[];
}

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
    if (!redis.isOpen) {
      await redis.connect();
      console.log("✅ Connected to Redis Cloud");
    }
  } catch (error) {
    console.error("🚨 Redis connection failed:", error);
  }
})();

// --- Redis Memory Helpers ---
async function getUserHistory(userId: string): Promise<ChatMessage[]> {
  try {
    const raw = await redis.get(`chat:${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("⚠️ Redis getUserHistory error:", err);
    return [];
  }
}

async function setUserHistory(userId: string, history: ChatMessage[]) {
  try {
    await redis.set(`chat:${userId}`, JSON.stringify(history), {
      EX: 60 * 60 * 24 * 7, // ⏳ 7 days expiry
    });
  } catch (err) {
    console.error("⚠️ Redis setUserHistory error:", err);
  }
}

// --- Tavily + Groq LLM Config
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY || "" });

const ENABLE_TAVILY = process.env.ENABLE_TAVILY === "true";
console.log(`🔍 Tavily Status: ${ENABLE_TAVILY ? "Enabled" : "Disabled"}`);

const vetKeywords = [
  "veterinary",
  "vet",
  "animal health",
  "diseases",
  "b.v.sc",
  "m.v.sc",
  "d.v.m",
  "livestock",
  "cattle",
  "poultry",
  "dog",
  "buffalo",
  "cat",
  "pet",
  "zoonotic",
  "anatomy",
  "pathology",
  "parasitology",
  "pharmacology",
  "swine",
  "toxicology",
  "surgery",
  "diagnosis",
  "vaccination",
  "epidemiology",
  "bird flu",
  "breeding",
  "nutrition",
  "theriogenology",
  "public health",
  "animal welfare",
  "research",
  "microbiology",
  "immunology",
  "veterinarian",
  "clinical",
  "therapeutics",
  "radiology",
  "livestock production management",
  "herd health",
  "equine",
  "ruminant",
  "companion animal",
  "exotic pets",
  "wildlife",
  "avian",
];

function isVetQuery(query: string): boolean {
  return vetKeywords.some((kw) => query.toLowerCase().includes(kw));
}

// --- Groq Model
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "",
  model: "llama-3.1-8b-instant",
  temperature: 1,
});

// --- Tavily Search
async function searchTavily(query: string): Promise<TavilySearchResponse> {
  console.log(`\n📡 Tavily Search Attempt: "${query}"`);

  if (!process.env.TAVILY_API_KEY) {
    throw new Error("Tavily API key is not configured");
  }

  const response = await tavilyClient.search(query, {
    search_depth: "advanced",
    include_domains: [
      "veterinaryworldpublisher.org",
      "ijvph.org",
      "journals.acspublisher.com",
      "epubs.icar.org.in",
      "jivaonline.net",
      "bmcvetres.biomedcentral.com",
      "www.mdpi.com",
      "openveterinaryjournal.com",
      "www.acvim.org",
    ],
  });

  return {
    results: response.results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    })),
  };
}

function formatToBullets(text: string): string {
  const parts = text
    .split(/[\n.]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? "\n" + parts.map((s) => `• ${s}`).join("\n\n") : text;
}

// --- API Route
export async function POST(req: Request) {
  try {
    const { question, userId } = await req.json();

    if (!question || !userId) {
      return NextResponse.json(
        { error: "Invalid input", answer: "Missing question or userId." },
        { status: 400 }
      );
    }
    // 🧠 Load conversation history
    const history: ChatMessage[] = await getUserHistory(userId);

    // 🧩 Check if any past veterinary context exists
    const hasVetContext = history.some(
      (msg) => msg.role === "user" && isVetQuery(msg.content)
    );

    // 🧱 Only block non-vet queries if there's no prior vet context
    if (!isVetQuery(question) && !hasVetContext) {
      return NextResponse.json({
        answer:
          "I can only answer questions related to veterinary medicine and animal health.",
      });
    }

    // Add new user message
    const userMessage: ChatMessage = { role: "user", content: question };
    history.push(userMessage);

    // Limit stored history
    while (history.length > 15) history.shift();

    const currentYear = new Date().getFullYear();
    const hasRecentYearQuery = /(202[4-9]|current|latest|recent)/i.test(
      question
    );

    // --- Tavily for fresh content
    if (ENABLE_TAVILY && hasRecentYearQuery) {
      try {
        const search = await searchTavily(question);
        if (search.results?.length > 0) {
          const top = search.results
            .slice(0, 3)
            .map((r) => `• [${r.title}](${r.url}) → ${r.content}`)
            .join("\n\n");

          history.push({ role: "assistant", content: top });
          await setUserHistory(userId, history);

          return NextResponse.json({
            answer: `🩺 Here’s the latest:\n\n${top}\n\n(Sources: Tavily API, ${currentYear})`,
          });
        }
      } catch (err) {
        console.warn("⚠️ Tavily failed:", err);
      }
    }

    // --- Groq Model Fallback
    const systemPrompt = {
      role: "system",
      content: "You are VetCare Assistant. Answer clearly and professionally.",
    };

    const messages = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
      type: msg.role,
    }));

    const llmResponse = await model.invoke([systemPrompt, ...messages]);

    const modelResponse =
      typeof llmResponse.content === "string"
        ? llmResponse.content
        : JSON.stringify(llmResponse.content);

    const formattedAnswer = formatToBullets(modelResponse);

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: formattedAnswer,
    };
    history.push(assistantMessage);

    await setUserHistory(userId, history);

    return NextResponse.json({ answer: `🩺 ${formattedAnswer}`, history });
  } catch (error) {
    console.error("❌ VetCare API error:", error);
    return NextResponse.json(
      { error: "Internal error", answer: "Something went wrong." },
      { status: 500 }
    );
  }
}
