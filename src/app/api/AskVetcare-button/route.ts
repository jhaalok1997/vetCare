import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";

// Allowed keywords to keep domain restricted
const vetKeywords = [
 "veterinary", "vet", "animal health", "b.v.sc", "m.v.sc", "d.v.m",
  "livestock", "cattle", "poultry", "dog", "cat", "pet", "zoonotic",
  "anatomy", "pathology", "parasitology", "pharmacology",
  "toxicology", "surgery", "diagnosis", "vaccination", "epidemiology",
  "animal breeding", "nutrition", "theriogenology", "public health",
  "research", "thesis", "dissertation", "case study", "animal welfare"
];

// Keyword check
function isVetQuery(query: string): boolean {
  return vetKeywords.some(kw => query.toLowerCase().includes(kw));
}

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "", // Put key in .env.local
  model: "llama-3.1-8b-instant",
  temperature: 0.3,
});

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!isVetQuery(question)) {
      return NextResponse.json({
        answer: "I don’t know about other domains, sorry.",
      });
    }

    const response = await model.invoke([
      {
        role: "system",
        content:
          "Hey, I am your Vet Assistant .I am expert in veterinary science Domain Only .",
      },
      { role: "user", content: question },
    ]);

    return NextResponse.json({ answer: response.content });
  } catch (error) {
    console.error("❌ AskVetAI API error:", error);
    return NextResponse.json(
      { answer: "Service temporarily unavailable, please try again later." },
      { status: 500 }
    );
  }
}
