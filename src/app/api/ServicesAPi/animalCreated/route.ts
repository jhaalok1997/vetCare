import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import AnimalCategory from "@/models/AnimalCategory";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { petName, animalType, petAge, petBreed } = body;

    if (!petName || !animalType || petAge === undefined || petAge === null) {
      return NextResponse.json(
        {
          success: false,
          message: "petName, animalType and petAge are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const ageNum = typeof petAge === "string" ? parseInt(petAge, 10) : petAge;

    const pet = await AnimalCategory.create({
      petName,
      animalType,
      petAge: ageNum,
      petBreed,
    });

    return NextResponse.json({ success: true, data: pet }, { status: 201 });
  } catch (error) {
    console.error("Error creating pet:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
