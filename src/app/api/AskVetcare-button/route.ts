import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { tavily } from "@tavily/core";

// Initialize Tavily SDK
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY || "" });

// Define Tavily response types
interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

interface TavilySearchResponse {
  results: TavilySearchResult[];
}

// --- Config
const ENABLE_TAVILY = process.env.ENABLE_TAVILY === "true"; // switchable config
console.log(`🔍 Tavily Status: ${ENABLE_TAVILY ? 'Enabled' : 'Disabled'}`);
console.log(`🔑 Tavily API Key: ${process.env.TAVILY_API_KEY ? 'Present' : 'Missing'}`);

// --- Domain restriction keywords
const vetKeywords = [
  "veterinary", "vet", "animal health","diseases", "b.v.sc", "m.v.sc", "d.v.m",
  "livestock Production", "cattle", "poultry", "dog","buffalo", "cat", "pet", "zoonotic",
  "anatomy", "pathology", "parasitology", "pharmacology", "parasitology","swine",
  "toxicology", "surgery", "diagnosis", "vaccination", "epidemiology","bird flu",
  "animal breeding", "nutrition", "theriogenology", "public health","antrox",
  "research", "thesis", "dissertation", "case study", "animal welfare",
];

function isVetQuery(query: string): boolean {
  return vetKeywords.some((kw) => query.toLowerCase().includes(kw));
}

// --- Groq Model via LangChain
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "",
  model: "llama-3.1-8b-instant",
  temperature: 0.3,
});

// --- Tavily Search Function using SDK
async function searchTavily(query: string): Promise<TavilySearchResponse> {
  console.log(`\n📡 Tavily Search Attempt:
  - Query: "${query}"
  - Time: ${new Date().toISOString()}
  - Enabled: ${ENABLE_TAVILY}`);

  if (!process.env.TAVILY_API_KEY) {
    console.error("❌ Tavily search failed: API key not configured");
    throw new Error("Tavily API key is not configured");
  }

  try {
    console.log("🔍 Starting Tavily search...");
    
    const response = await tavilyClient.search(query, {
      search_depth: "advanced",
      include_domains: [
        "avma.org",
        "vin.com",
        "merckvetmanual.com",
        "vetfolio.com",
        "ncbi.nlm.nih.gov",
        "pubmed.gov",
      ]
    });

    console.log(`✅ Tavily search successful:
    - Results found: ${response.results.length}
    - First result: "${response.results[0]?.title || 'No results'}"
    `);

    return {
      results: response.results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.content
      }))
    };
  } catch (error) {
    console.error("❌ Tavily search failed:", error);
    throw error;
  }
}

// --- Format LLM text into bullet points (basic heuristic)
function formatToBullets(text: string): string {
  // Split by sentence or line breaks
  const parts = text.split(/[\n.]/).map((s) => s.trim()).filter((s) => s.length > 0);

  if (parts.length === 0) return text;

  // Add extra newline before each bullet point
  return "\n" + parts.map((s) => `• ${s}`).join("\n\n");
}

// --- Next.js API Route
export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Invalid input", answer: "Please provide a valid question." },
        { status: 400 }
      );
    }

    // Domain restriction
    if (!isVetQuery(question)) {
      return NextResponse.json({
        answer: "I can only answer questions related to veterinary medicine and animal health.",
      });
    }

    // Check if query is about current events or recent years
    const currentYear = new Date().getFullYear();
    const yearPattern = /20[0-9]{2}/g;
    const years = question.match(yearPattern);
    const hasRecentYearQuery = years?.some(year => parseInt(year) > 2023) || 
                              question.toLowerCase().includes("current") ||
                              question.toLowerCase().includes("latest") ||
                              question.toLowerCase().includes("recent");

    console.log(`\n🔄 Query Analysis:
    - Question: "${question}"
    - Contains recent year: ${years ? `Yes (${years.join(', ')})` : 'No'}
    - Is current/latest query: ${hasRecentYearQuery ? 'Yes' : 'No'}
    - Will use Tavily: ${(ENABLE_TAVILY && hasRecentYearQuery) ? 'Yes' : 'No'}`);

    // --- Step 1: Use Tavily for current/recent queries, otherwise use Groq
    if (ENABLE_TAVILY && hasRecentYearQuery) {
      try {
        const search = await searchTavily(question);

        if (search.results && search.results.length > 0) {
          const topResults = search.results
            .slice(0, 3)
            .map(
              (r: TavilySearchResult) =>
                `\n• [${r.title}](${r.url}) →\n  ${r.content}`
            )
            .join("\n\n");

          return NextResponse.json({
            answer: `🩺 VetCare Assistant Response\n\n**Question:** ${question}\n\n**Answer:**\n${topResults}\n\n(Sources: Latest information via Tavily API, ${currentYear})`
          });
        }
      } catch (err) {
        console.warn("⚠️ Tavily search failed:", err);
        // Fall through to LLM if Tavily fails
      }
    }

    // --- Step 2: Use Groq model answer as fallback or for non-current queries
    const llmResponse = await model.invoke([
      {
        role: "system",
        content: "You are VetCare Assistant. You answer only veterinary-related questions clearly and professionally.",
      },
      { role: "user", content: question },
    ]);

    let answer =
      typeof llmResponse.content === "string"
        ? llmResponse.content
        : JSON.stringify(llmResponse.content);

    // Format Groq output into bullet points
    answer = formatToBullets(answer);

    // --- Step 2: Tavily fallback (only if enabled + answer is weak)
    if (
      ENABLE_TAVILY &&
      (answer.toLowerCase().includes("i don’t know") ||
        answer.toLowerCase().includes("not sure") ||
        answer.length < 50)
    ) {
      console.log("🌐 Tavily FALLBACK called for weak Groq answer:", question); 
      try {
        const search = await searchTavily(question);

        if (search.results && search.results.length > 0) {
          const topResults = search.results
            .slice(0, 3)
            .map(
              (r: TavilySearchResult) =>
                `• [${r.title}](${r.url}) → ${r.content}`
            )
            .join("\n");

          answer = `Here’s what I found from trusted sources:\n\n${topResults}\n\n(Sources via Tavily API)`;
        }
      } catch (err) {
        console.warn("⚠️ Tavily fallback failed:", err);
      }
    }

    // --- Final structured response (clean, bullets)
    const formatted = `🩺 ${answer}`;

    return NextResponse.json({ answer: formatted });
  } catch (error) {
    console.error("❌ VetCare API error:", error);
    return NextResponse.json(
      {
        error: "Internal error",
        answer: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
