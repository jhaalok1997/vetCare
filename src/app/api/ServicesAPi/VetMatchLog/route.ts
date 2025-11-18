import { connectDB } from "@/lib/mongoDb";
import VetMatchLog from "@/models/VetMatchLog";
import { NextRequest, NextResponse } from "next/server";

interface VetMatchLogData {
  userId?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  animalType: string;
  diseaseCategory: string;
  matchedVet: string;
  appointmentDate?: string;
  status?: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = (await req.json()) as VetMatchLogData;

    if (!body.animalType || !body.diseaseCategory || !body.matchedVet) {
      return NextResponse.json(
        { success: false, error: "animalType, diseaseCategory and matchedVet are required" },
        { status: 400 }
      );
    }

    const log = await VetMatchLog.create({
      ...body,
      appointmentDate: body.appointmentDate ? new Date(body.appointmentDate) : undefined,
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}