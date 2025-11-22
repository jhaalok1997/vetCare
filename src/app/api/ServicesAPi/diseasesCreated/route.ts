import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
//import mongoose from "mongoose";
import DiseaseCategory from "@/models/DiseasesCategory";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // console.log('Received request body:', body);

    const {
      DiseaseType,
      UrgencyLevel: rawUrgencyLevel,
      Duration,
      Symptoms,
      AdditionalInfo,
    } = body;

    // Detailed validation logging
    if (!DiseaseType) {
      return NextResponse.json(
        { success: false, message: "DiseaseType is required" },
        { status: 400 }
      );
    }
    if (!rawUrgencyLevel) {
      return NextResponse.json(
        { success: false, message: "UrgencyLevel is required" },
        { status: 400 }
      );
    }
    if (!Duration) {
      return NextResponse.json(
        { success: false, message: "Duration is required" },
        { status: 400 }
      );
    }
    if (!Symptoms) {
      return NextResponse.json(
        { success: false, message: "Symptoms array is required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(Symptoms)) {
      return NextResponse.json(
        { success: false, message: "Symptoms must be an array" },
        { status: 400 }
      );
    }
    if (Symptoms.length === 0) {
      return NextResponse.json(
        { success: false, message: "Symptoms array cannot be empty" },
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

    // Validate Duration is a positive number
    if (typeof Duration !== "number" || Duration <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration must be a positive number",
        },
        { status: 400 }
      );
    }

    const diseaseCategory = await DiseaseCategory.create({
      DiseaseType,
      UrgencyLevel,
      Duration,
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
