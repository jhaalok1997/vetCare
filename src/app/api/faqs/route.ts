import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ Missing GOOGLE_API_KEY in .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Function to generate fresh FAQs from the AI model
async function generateFAQs() {
  const prompt = `
   Generate exactly 6 FAQs in JSON format with keys "question" and "answer".
Each FAQ should be informative, concise, and understandable for pet owners, students, and veterinary professionals.
Base the topics on the veterinary science syllabus of Banaras Hindu University and other top Indian government veterinary universities:

Tamil Nadu Veterinary and Animal Sciences University (TANUVAS)

Karnataka Veterinary, Animal and Fisheries Sciences University (KVAFSU)

Maharashtra Animal and Fishery Sciences University (MAFSU)

West Bengal University of Animal and Fishery Sciences (WBUAFS)

Guru Angad Dev Veterinary and Animal Sciences University (GADVASU)

Focus on cattle, poultry, BVSc curriculum, animal health, nutrition, reproduction, and clinical practices.

Make sure each answer:

Starts with a simple explanation (for pet owners).

Adds a student-oriented perspective (linking to syllabus/learning).

Ends with a technical or professional insight (clinical/industry).
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); //  llm Model
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
      {
        question: "What is veterinary science?",
        answer: "It is the study of animal health and medical care.",
      },
      {
        question: "How long does a veterinary degree take?",
        answer: "It usually takes 5–6 years to complete.",
      },
    ];
  }
}

let cachedFAQs: Array<{ question: string; answer: string }> = [];
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
  } catch (error: unknown) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      [
        {
          question: "Service temporarily unavailable",
          answer: "Please try again later.",
        },
      ],
      { status: 500 }
    );
  }
}
