import { connectDB } from "@/lib/mongoDb";
import VetProfile from '@/models/VetProfile';
import { NextRequest, NextResponse } from "next/server";

interface VetProfileData {
    name: string;
    qualifications: string;
    experienceYears: number;
    contact: {
        phone: string;
        email: string;
        location: string;
        teleconsultAvailable: boolean;
    }
    animalExpertise?: string[];
    diseaseExpertise?: string[];
    tags?: string[];
    rating?: number;
    isActive?: boolean;
}



// Creating Vet Profile data
export async function POST(req: NextRequest) {

    await connectDB();

    try {
        const body = await req.json() as VetProfileData;
        const vet = await VetProfile.create(body);
        return NextResponse.json({ success: true, data: vet }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}

// Fetching Vet Profile data
export async function GET() {
    await connectDB();

    try {
        const vets = await VetProfile.find({})
            .populate('diseaseExpertise');
        return NextResponse.json({ success: true, data: vets }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

// Search for vets based on animal and disease expertise
export async function PUT(req: NextRequest) {
    await connectDB();

    try {
        const body = await req.json();
        const { animalTypeId, diseaseCategoryId } = body;

        if (!animalTypeId || !diseaseCategoryId) {
            return NextResponse.json(
                { success: false, error: 'animalTypeId and diseaseCategoryId are required' },
                { status: 400 }
            );
        }

        const matchedVets = await VetProfile.find({
            animalExpertise: animalTypeId,
            diseaseExpertise: diseaseCategoryId,
            isActive: true,
        }).populate('diseaseExpertise');

        return NextResponse.json(
            {
                success: true,
                data: matchedVets
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            {
                success: false,
                error: errorMessage
            },
            { status: 400 }
        );
    }
}

