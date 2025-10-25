import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
//import mongoose from "mongoose";
import DiseaseCategory from "@/models/DiseasesCategory";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      DiseaseType,
      UrgencyLevel: rawUrgencyLevel,
      Symptoms,
      AdditionalInfo,
    } = body;

    if (
      !DiseaseType ||
      !rawUrgencyLevel ||
      !Symptoms ||
      !Array.isArray(Symptoms) ||
      Symptoms.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "DiseaseType, UrgencyLevel, and Symptoms (array) are required",
        },
        { status: 400 }
      );
    }

    // Convert urgency level to proper case
    const UrgencyLevel =
      rawUrgencyLevel.charAt(0).toUpperCase() +
      rawUrgencyLevel.slice(1).toLowerCase();

    if (!["Low", "Medium", "High"].includes(UrgencyLevel)) {
      return NextResponse.json(
        {
          success: false,
          message: "UrgencyLevel must be one of Low, Medium, High",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for existing disease record with same type and symptoms
    const existingDisease = await DiseaseCategory.findOne({
      DiseaseType: DiseaseType,
      Symptoms: { $all: Symptoms },
    });

    if (existingDisease) {
      return NextResponse.json(
        {
          success: false,
          message: "A similar disease case already exists with these symptoms",
          isExisting: true,
        },
        { status: 409 }
      );
    }

    const diseaseCategory = await DiseaseCategory.create({
      DiseaseType,
      UrgencyLevel,
      Symptoms,
      AdditionalInfo,
    });

    return NextResponse.json(
      { success: true, data: diseaseCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating disease category:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
