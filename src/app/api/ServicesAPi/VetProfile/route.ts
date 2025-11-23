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

// Fetching Vet Profile data with advanced filtering
export async function GET(req: NextRequest) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const location = searchParams.get("location");
        const animalExpertise = searchParams.get("animalExpertise");
        const diseaseExpertise = searchParams.get("diseaseExpertise");
        const sortBy = searchParams.get("sortBy") || "rating"; // rating, experienceYears, name
        const sortOrder = searchParams.get("sortOrder") || "desc"; // asc, desc
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const activeOnly = searchParams.get("activeOnly") !== "false"; // default true

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (activeOnly) {
            query.isActive = true;
        }

        if (location) {
            query["contact.location"] = { $regex: location, $options: "i" };
        }

        if (animalExpertise) {
            query.animalExpertise = animalExpertise;
        }

        if (diseaseExpertise) {
            query.diseaseExpertise = diseaseExpertise;
        }

        // Build sort object
        const sortObj: { [key: string]: 1 | -1 } = {};
        sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

        const skip = (page - 1) * limit;

        const vets = await VetProfile.find(query)
            .populate('diseaseExpertise')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        const total = await VetProfile.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: vets,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        }, { status: 200 });
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

