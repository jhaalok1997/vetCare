import { connectDB } from "@/lib/mongoDb";
import VetMatchLog from '@/models/VetMatchLog';
import { NextRequest, NextResponse } from "next/server";

interface VetMatchLogData {
  userId: string;
  animalType: string;
  diseaseCategory: string;
  matchedVet: string;
}



export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json() as VetMatchLogData;
    const log = await VetMatchLog.create(body);
    return NextResponse.json(
        { success: true, data: log },
        { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
    );
  }
}