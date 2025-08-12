import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ Missing GOOGLE_API_KEY in .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Function to generate fresh FAQs from the AI model
async function generateFAQs() {
  const prompt = `
    Generate exactly 6 FAQs in JSON format with keys 'question' and 'answer' 
    about veterinary science for students and Professionals. 
    Do NOT add markdown formatting or extra text.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Remove markdown code fences like ```json or ```
    text = text.replace(/```json|```/gi, "").trim();

    // Extract only JSON array part
    const jsonMatch = text.match(/\[([\s\S]*?)\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    return JSON.parse(text);
  } catch (err) {
    console.error("❌ Failed to generate FAQs:", err);
    return [
      { question: "What is veterinary science?", answer: "It is the study of animal health and medical care." },
      { question: "How long does a veterinary degree take?", answer: "It usually takes 5–6 years to complete." },
    ];
  }
}

let cachedFAQs: any[] = [];
let lastGenerated = 0;

export async function GET() {
  try {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (!cachedFAQs.length || now - lastGenerated > oneHour) {
      cachedFAQs = await generateFAQs();
      lastGenerated = now;
    }

    return NextResponse.json(cachedFAQs);
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      [{ question: "Service temporarily unavailable", answer: "Please try again later." }],
      { status: 500 }
    );
  }
}
