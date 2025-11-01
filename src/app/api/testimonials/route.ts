import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ Missing GOOGLE_API_KEY in .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Function to generate fresh testimonials from the AI model
async function generateTestimonials() {
  const prompt = `
Generate exactly 4 testimonials in JSON format with keys "name", "role", and "feedback".
Each testimonial should be authentic,Looks human , Authentic , Natural ,Genuine ,Realistic  diverse, and reflect real experiences from different perspectives.

The testimonials should be from:
1. A veterinary surgeon/doctor
2. A veterinary student (preferably from Indian universities like BHU, TANUVAS, KVAFSU, etc.)
3. A pet owner
4. A veterinary researcher/professor

Guidelines:
- Names should sound authentic and diverse (Indian names preferred for variety)
- Don't repeat the Names and Feedback , Always take care of that
- Roles should be specific (e.g., "Veterinary Surgeon", "B.V.Sc. Student,"M.V.Sc. Student","BHU", "Pet Owner", "Veterinary Researcher")
- Feedback should be personal, specific, and mention actual features of Vet🐾Care like:
  * AI-powered clinical insights
  * Predictive analytics
  * Knowledge graphs
  * Smart learning modules
  * Symptom checkers
  * Clinical simulations
- Keep feedback concise (1-2 sentences, max 150 characters)
- Looks human , Authentic , Natural ,Genuine ,Realistic 
- Make it sound natural and genuine
- Vary the tone - some professional, some casual

Return ONLY a valid JSON array with no additional text or markdown formatting.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // llm Model
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
    console.error("❌ Failed to generate testimonials:", err);
    // Fallback testimonials
    return [
      {
        name: "Dr. Meera Sharma",
        role: "Veterinary Surgeon",
        feedback: "Vet🐾Care's predictive analytics helped me anticipate seasonal disease outbreaks. It's like having an AI-powered colleague by my side.",
      },
      {
        name: "Akash Jha",
        role: "B.V.Sc. Student, BHU",
        feedback: "The AI-driven quizzes and clinical simulations made my study routine engaging. I feel more confident preparing for exams and real cases.",
      },
      {
        name: "Neha Gupta",
        role: "Pet Owner",
        feedback: "I used the symptom checker for my Labrador, and the guidance was spot-on. It gave me peace of mind before visiting the vet🐾Care.",
      },
      {
        name: "Prof. R.K. Mishra",
        role: "Veterinary Researcher",
        feedback: "The ontology-driven knowledge graph is a goldmine for comparative studies in veterinary pharmacology.",
      },
    ];
  }
}

let cachedTestimonials: Array<{ name: string; role: string; feedback: string }> = [];
let lastGenerated = 0;

export async function GET() {
  try {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Regenerate testimonials every hour
    if (!cachedTestimonials.length || now - lastGenerated > oneHour) {
      cachedTestimonials = await generateTestimonials();
      lastGenerated = now;
    }

    return NextResponse.json(cachedTestimonials);
  } catch (error: unknown) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      [
        {
          name: "Service unavailable",
          role: "System",
          feedback: "Please try again later.",
        },
      ],
      { status: 500 }
    );
  }
}

