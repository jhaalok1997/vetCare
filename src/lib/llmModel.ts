import { ChatGroq } from "@langchain/groq";

// ---------- Groq Model ----------
export const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "",
  model:"llama-3.3-70b-versatile" , // "llama-3.1-8b-instant",
  temperature: 1,
});