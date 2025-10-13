import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import DiseaseCategory from '@/models/DiseasesCategory';

interface DiseasesCategoryData {
    name: string;
    animalTypes: string[];
    description: string;
}

//  Creating Diseases Data
export async function POST(req: NextRequest) {

  await connectDB();

  try {
    const data: DiseasesCategoryData = await req.json();
    const disease = await DiseaseCategory.create(data);
    return NextResponse.json(
        { success: true, data: disease },
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


// Fetching Diseases Data 
export async function GET() {

  await connectDB();

  try {
    const diseases = await DiseaseCategory.find({}).populate('animalTypes');
    return NextResponse.json(
        { success: true, data: diseases },
        { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
    );
  }
}
  