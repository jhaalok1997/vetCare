import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import PatientOwner from "@/models/PatientOwner";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ownerEmail, countryCode, ownerPhone, preferredContactMethod } =
      body;

    if (!ownerEmail || !countryCode || !ownerPhone || !preferredContactMethod) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

   // Check for existing owner with same email or phone
    // const existingOwner = await PatientOwner.findOne({
    //   $or: [
    //     { ownerEmail: ownerEmail },
    //     { ownerPhone: ownerPhone, countryCode: countryCode },
    //   ],
    // });

    // if (existingOwner) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "Owner with this email or phone number already exists",
    //       isExisting: true,
    //     },
    //     { status: 409 }
    //   );
    // }

    const patientOwner = await PatientOwner.create({
      ownerEmail,
      countryCode,
      ownerPhone,
      preferredContactMethod,
    });

    return NextResponse.json(
      { success: true, data: patientOwner },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating patient owner:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
