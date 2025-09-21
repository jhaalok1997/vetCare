import { NextResponse , NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import AnimalType from '@/models/AnimalType';

interface AnimalTypeData {
    name: string;
    icon: string;
}

// Creating Animal data
export async function POST(req: NextRequest): Promise<NextResponse> {

  await connectDB();

  try {
    const body = await req.json();
    const data: AnimalTypeData = body;
    const animal = await AnimalType.create(data);
    return NextResponse.json(
        { success: true, data: animal },
        { status: 201 }
        );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
        );
  }
}


// Fetching Animal Data
export async function GET() {

    await connectDB();
  
    try {
        const animals = await AnimalType.find({});
        return NextResponse.json(
            { success: true, data: animals },
            { status: 200 }
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
  