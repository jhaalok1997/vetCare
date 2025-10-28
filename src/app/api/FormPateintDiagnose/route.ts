import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { connectDB } from "@/lib/mongoDb";
import DiagnosisReport from "@/models/DiagnosisReport";

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "",
  model: "llama-3.3-70b-versatile",
  temperature: 1,
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    const prompt = `
You are an expert veterinarian assistant.
Analyze the pet's condition and provide:

1️⃣ Possible diseases (max 3)
2️⃣ Short description for each
3️⃣ Immediate home care advice
4️⃣ When to seek urgent veterinary care

Pet Info:
Animal: ${data.animalType}
Age: ${data.petAge}
Symptoms: ${data.symptoms}
Urgency: ${data.urgency}
Additional Notes: ${data.additionalNotes || "None"}

Respond clearly using bullet points.
`;

    const systemMsg = new SystemMessage(
      "You are VetCare Assistant. Provide concise, clinically sound veterinary guidance formatted in clear bullet points."
    );
    const userMsg = new HumanMessage(prompt);

    const llmResponse = await model.invoke([systemMsg, userMsg]);

    const report =
      typeof llmResponse.content === "string"
        ? llmResponse.content
        : JSON.stringify(llmResponse.content);

    // 💾 Save the diagnosis in MongoDB
    await DiagnosisReport.create({
      animalType: data.animalType,
      petAge: data.petAge,
      symptoms: data.symptoms,
      urgency: data.urgency,
      additionalNotes: data.additionalNotes,
      report,
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Diagnosis API Error:", error);
    return NextResponse.json({ error: "Failed to generate diagnosis." }, { status: 500 });
  }
}
