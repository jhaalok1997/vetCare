import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/AccountUser";
import VetProfile from "@/models/VetProfile";

export async function GET(req: Request) {
  try {
    // Connect to database
    await connectDB();

    // Check if user is admin
    const userHeader = req.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json(
        { error: "Unauthorized - No user header found" },
        { status: 401 }
      );
    }

    let user;
    try {
      user = JSON.parse(userHeader);
    } catch (e) {
      console.error("Failed to parse user header:", e);
      return NextResponse.json(
        { error: "Invalid user data format" },
        { status: 400 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get all veterinarians from User model
    const vets = await User.find({ role: "vet" })
      .select("username email phone createdAt updatedAt")
      .sort({ createdAt: -1 });

    // Get VetProfile data
    const vetProfiles = await VetProfile.find()
      .populate('animalExpertise')
      .populate('diseaseExpertise')
      .sort({ createdAt: -1 });

    // Combine the data - merge vet users with their profiles
    const combinedVetData = vets.map((vet) => {
      const profile = vetProfiles.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.contact?.email === vet.email
      );

      return {
        _id: vet._id,
        username: vet.username,
        email: vet.email,
        phone: vet.phone || profile?.contact?.phone,
        specialization: profile?.tags?.join(', ') || 'General Practice',
        licenseNumber: profile?.qualifications || 'N/A',
        clinicName: profile?.name || 'N/A',
        address: profile?.contact?.location || 'N/A',
        isVerified: profile?.isActive || false,
        createdAt: vet.createdAt,
        status: profile?.isActive ? 'active' : 'inactive',
      };
    });

    return NextResponse.json({
      vets: combinedVetData,
      total: combinedVetData.length,
      verified: combinedVetData.filter(v => v.isVerified).length,
      unverified: combinedVetData.filter(v => !v.isVerified).length,
    });
  } catch (error) {
    console.error("Vet profiles fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vet profiles" },
      { status: 500 }
    );
  }
}

