import { NextResponse } from "next/server";
import { model } from "@/lib/llmModel";
import { tavily } from "@tavily/core";
import { getRedisClient } from "@/lib/redisconfig";

// ---------- Interfaces ----------
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



// ---------- Redis Helpers ----------
async function getUserHistory(userId: string): Promise<ChatMessage[]> {
  try {
    const client = await getRedisClient();
    const raw = await client.get(`chat:${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("⚠️ Redis getUserHistory error:", err);
    return [];
  }
}

async function setUserHistory(userId: string, history: ChatMessage[]) {
  try {
    const client = await getRedisClient();
    await client.set(`chat:${userId}`, JSON.stringify(history), {
      EX: 60 * 60 * 24 * 7, // 🕓 TTL (Time to live )Expire in 7 days
    });
  } catch (err) {
    console.error("⚠️ Redis setUserHistory error:", err);
  }
}

// ---------- Tavily + Groq Setup ----------
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY || "" });
const ENABLE_TAVILY = process.env.ENABLE_TAVILY === "true";

// console.log(`🔍 Tavily Status: ${ENABLE_TAVILY ? "Enabled" : "Disabled"}`);

const vetKeywords = [
  "veterinary", "vet", "animal health", "diseases", "b.v.sc", "m.v.sc",
  "d.v.m", "livestock", "cattle", "poultry", "dog", "buffalo", "cat",
  "pet", "zoonotic", "anatomy", "pathology", "parasitology",
  "pharmacology", "swine", "toxicology", "surgery", "diagnosis",
  "vaccination", "epidemiology", "bird flu", "breeding", "nutrition",
  "theriogenology", "public health", "animal welfare", "research",
  "microbiology", "immunology", "veterinarian", "clinical",
  "therapeutics", "radiology", "livestock production management",
  "herd health", "equine", "ruminant", "companion animal",
  "exotic pets", "wildlife", "avian",
];

function isVetQuery(query: string): boolean {
  return vetKeywords.some((kw) => query.toLowerCase().includes(kw));
}



// ---------- Tavily Search ----------
async function searchTavily(query: string): Promise<TavilySearchResponse> {
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

// ---------- Utility ----------
function formatToBullets(text: string): string {
  const parts = text
    .split(/[\n.]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? "\n" + parts.map((s) => `• ${s}`).join("\n\n") : text;
}

// ---------- MAIN API ----------
export async function POST(req: Request) {
  try {
    const { question, userId } = await req.json();

    if (!question || !userId) {
      return NextResponse.json(
        { error: "Invalid input", answer: "Missing question or userId." },
        { status: 400 }
      );
    }

    // 🧠 Get current history
    const history: ChatMessage[] = await getUserHistory(userId);

    // 🧩 Ensure context
    const hasVetContext = history.some(
      (msg) => msg.role === "user" && isVetQuery(msg.content)
    );

    // 🧱 Restrict non-vet questions
    if (!isVetQuery(question) && !hasVetContext) {
      return NextResponse.json({
        answer:
          "⚕️ I can only answer questions related to veterinary medicine and animal health.",
        history,
      });
    }

    // ➕ Add new user message
    history.push({ role: "user", content: question });
    if (history.length > 20) history.splice(0, history.length - 20); // Keep last 20 messages

    const currentYear = new Date().getFullYear();
    const hasRecentYearQuery = /(202[4-9]|current|latest|recent)/i.test(question);

    // ---------- Tavily Integration ----------
    if (ENABLE_TAVILY && hasRecentYearQuery) {
      try {
        const search = await searchTavily(question);
        if (search.results?.length > 0) {
          const top = search.results
            .slice(0, 3)
            .map((r) => `• [${r.title}](${r.url}) → ${r.content}`)
            .join("\n\n");

          const answer = `🩺 Here’s the latest:\n\n${top}\n\n(Sources: Tavily API, ${currentYear})`;
          history.push({ role: "assistant", content: answer });
          await setUserHistory(userId, history);
          return NextResponse.json({ answer, history });
        }
      } catch (err) {
        console.warn("⚠️ Tavily failed:", err);
      }
    }

    // ---------- Groq LLM ----------
    const systemPrompt = {
      role: "system",
      content:
        "You are VetCare Assistant. Answer veterinary and animal health-related questions clearly and professionally.",
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

    const formattedAnswer = `🩺 ${formatToBullets(modelResponse)}`;

    history.push({ role: "assistant", content: formattedAnswer });
    await setUserHistory(userId, history);

    return NextResponse.json({ answer: formattedAnswer, history });
  } catch (error) {
    console.error("❌ VetCare API error:", error);
    return NextResponse.json(
      { error: "Internal error", answer: "Something went wrong." },
      { status: 500 }
    );
  }
}
