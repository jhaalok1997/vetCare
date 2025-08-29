import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { tavily } from "@tavily/core";
import NodeCache from "node-cache";

// 🧠 In-memory cache (per userId)
const memoryCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Initialize Tavily SDK
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY || "" });

// --- Types
interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

interface TavilySearchResponse {
  results: TavilySearchResult[];
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// --- Config
const ENABLE_TAVILY = process.env.ENABLE_TAVILY === "true"; 
console.log(`🔍 Tavily Status: ${ENABLE_TAVILY ? 'Enabled' : 'Disabled'}`);
console.log(`🔑 Tavily API Key: ${process.env.TAVILY_API_KEY ? 'Present' : 'Missing'}`);

// --- Keywords
const vetKeywords = [
  "veterinary","vet","animal health","diseases","b.v.sc","m.v.sc","d.v.m",
  "livestock","cattle","poultry","dog","buffalo","cat","pet","zoonotic",
  "anatomy","pathology","parasitology","pharmacology","swine","toxicology",
  "surgery","diagnosis","vaccination","epidemiology","bird flu","breeding",
  "nutrition","theriogenology","public health","animal welfare","research",
  "microbiology","immunology","veterinarian","veterinarians","veterinaria",
  "mycology","bacteriology","physiology","clinical","therapeutics","radiology",
  "toxicology","livestock production management","herd health","equine","ruminant",
  "companion animal","exotic pets","pathogenesis","pharmacokinetics","clinical trials",
  "diagnosis","treatment","prevention","shelter medicine","wildlife","avian","prognosis",
  "neoplasm","osteosarcoma","lymphoma","mast cell tumor","hemangiosarcoma","melanoma",
  "veterinary public health",""
];
function isVetQuery(query: string): boolean {
  return vetKeywords.some((kw) => query.toLowerCase().includes(kw));
}

// --- Groq LLM
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "",
  model: "llama-3.1-8b-instant",
  temperature: 0.2,
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
      "avma.org",
      "vin.com",
      "merckvetmanual.com",
      "vetfolio.com",
      "ncbi.nlm.nih.gov",
      "pubmed.gov",
      "vetstudy.journeywithasr.com"
    ],
  });

  return {
    results: response.results.map(r => ({
      title: r.title,
      url: r.url,
      content: r.content,
    })),
  };
}

// --- Format helper
function formatToBullets(text: string): string {
  const parts = text.split(/[\n.]/).map((s) => s.trim()).filter(Boolean);
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

    if (!isVetQuery(question)) {
      return NextResponse.json({
        answer: "I can only answer questions related to veterinary medicine and animal health.",
      });
    }

    // 🧠 Get conversation history for this user
    const history: ChatMessage[] = (memoryCache.get(userId) as ChatMessage[]) || [];
    
    // Add user's question to history
    const userMessage: ChatMessage = { role: "user", content: question };
    history.push(userMessage);

    // Clean old messages if history is too long (keep last 10 messages)
    while (history.length > 15) {
      history.shift();
    }

    // --- Detect current info
    const currentYear = new Date().getFullYear();
    const yearsMatch = question.match(/20[0-9]{2}/g);
    const years: string[] = yearsMatch || [];
    const hasRecentYearQuery =
      years.some((year: string) => parseInt(year, 10) > 2023) ||
      /(current|latest|recent)/i.test(question);

    // --- Step 1: Tavily for fresh queries
    if (ENABLE_TAVILY && hasRecentYearQuery) {
      try {
        const search = await searchTavily(question);
        if (search.results?.length > 0) {
          const top = search.results.slice(0, 3).map(r =>
            `• [${r.title}](${r.url}) → ${r.content}`
          ).join("\n\n");

          history.push({ role: "assistant", content: top });
          memoryCache.set(userId, history);

          return NextResponse.json({
            answer: `🩺 Here’s the latest:\n\n${top}\n\n(Sources: Tavily API, ${currentYear})`
          });
        }
      } catch (err) {
        console.warn("⚠️ Tavily failed:", err);
      }
    }

    // --- Step 2: Groq model fallback
    const systemPrompt = { role: "system", content: "You are VetCare Assistant. Answer clearly and professionally." };
    
    try {
      // Convert history to LangChain format
      const messages = history.map(msg => ({
        role: msg.role,
        content: msg.content,
        type: msg.role // Add type field for LangChain compatibility
      }));

      const llmResponse = await model.invoke([
        systemPrompt,
        ...messages
      ]);

      const modelResponse = typeof llmResponse.content === "string"
        ? llmResponse.content
        : JSON.stringify(llmResponse.content);

      const formattedAnswer = formatToBullets(modelResponse);
      
      // Add assistant's response to history
      const assistantMessage: ChatMessage = { 
        role: "assistant", 
        content: formattedAnswer 
      };
      history.push(assistantMessage);
      
      // Save updated history
      memoryCache.set(userId, history);

      return NextResponse.json({ answer: `🩺 ${formattedAnswer}`, history });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(" Groq model error:", errorMessage);
      
      // Add error to history so we know where conversation broke
      history.push({ 
        role: "system", 
        content: "Error: Model failed to respond" 
      });
      memoryCache.set(userId, history);

      return NextResponse.json(
        { error: "Model error", answer: "I'm having trouble right now. Please try again." },
        { status: 500 }
      );
    }

    throw new Error("Unreachable code - response should have been sent already");
  } catch (error) {
    console.error("❌ VetCare API error:", error);
    return NextResponse.json(
      { error: "Internal error", answer: "Something went wrong." },
      { status: 500 }
    );
  }
}
