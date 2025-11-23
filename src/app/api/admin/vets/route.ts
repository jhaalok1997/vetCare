// app/api/admin/vets/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/AccountUser";
import VetProfile from "@/models/VetProfile";

// ✅ FIX ADDED:
// Importing models WITHOUT assigning to variables ensures mongoose registers them.
// DO NOT IMPORT WITH VARIABLE NAMES (ex: animalSchema) — unnecessary.
// These imports MUST run before populate() is used.
import "@/models/AnimalCategory";   // <-- FIX: registers AnimalCategory model
import "@/models/DiseasesCategory";  // <-- FIX: registers DiseaseCategory model

import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

interface AdminJwtPayload extends JwtPayload {
  id?: string;
  email?: string;
  role?: string;
  tenantId?: string;
}

/**
 * Authentication helper
 * Works with both x-user header (reverse-proxy) or cookie JWT.
 */
async function requireAdmin(req: Request): Promise<AdminJwtPayload | NextResponse> {
  const userHeader = req.headers.get("x-user");

  if (userHeader) {
    try {
      const parsed = JSON.parse(userHeader) as AdminJwtPayload;
      if (parsed.role === "admin") return parsed;
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    } catch (err) {
      console.error("Failed to parse x-user header:", err);
    }
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized - No user information found" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, SECRET) as AdminJwtPayload;
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }
    return decoded;
  } catch (err) {
    console.error("Failed to verify admin token:", err);
    return NextResponse.json({ error: "Invalid or expired admin token" }, { status: 401 });
  }
}

/**
 * GET: Fetch all vets + vet profiles
 */
export async function GET(req: Request) {
  try {
    await connectDB();

    // Authentication
    const adminOrResponse = await requireAdmin(req);
    if (adminOrResponse instanceof NextResponse) return adminOrResponse;

    // Fetch ONLY users with role vet
    const vets = await User.find({ role: "vet" })
      .select("username email phone createdAt updatedAt")
      .sort({ createdAt: -1 });

    // Fetch vet profiles and populate relations
    // ✅ FIXED: populate works now because model imports above register schemas
    const vetProfiles = await VetProfile.find()
      .populate("animalExpertise")   // works now
      .populate("diseaseExpertise")  // works now
      .sort({ createdAt: -1 });

    const combined = vets.map((vet) => {
      const vetId = vet?._id ? String(vet._id) : null;

      const profile = vetProfiles.find((p) => {
        const pAcc = p?.accountUser ? String(p.accountUser) : null;
        return (
          (pAcc && vetId && pAcc === vetId) ||
          (p?.contact?.email && p.contact.email === vet.email)
        );
      });

      const isVerified = Boolean(profile?.isActive);

      return {
        _id: vet._id,
        username: vet.username || "N/A",
        email: vet.email || "N/A",
        phone: vet.phone || profile?.contact?.phone || null,
        specialization:
          Array.isArray(profile?.tags) && profile.tags.length
            ? profile.tags.join(", ")
            : "General Practice",
        licenseNumber: profile?.qualifications || "N/A",
        clinicName: profile?.name || "N/A",
        address: profile?.contact?.location || "N/A",

        // Populated fields
        expertiseAnimals: profile?.animalExpertise || [],
        expertiseDiseases: profile?.diseaseExpertise || [],

        isVerified,
        status: isVerified ? "active" : "inactive",
        createdAt: vet.createdAt,
      };
    });

    return NextResponse.json({
      vets: combined,
      total: combined.length,
      verified: combined.filter((v) => v.isVerified).length,
      unverified: combined.filter((v) => !v.isVerified).length,
    });
  } catch (err) {
    console.error("Vet profiles fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vet profiles" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update vet verification status
 */
export async function PATCH(req: Request) {
  try {
    await connectDB();

    const adminOrResponse = await requireAdmin(req);
    if (adminOrResponse instanceof NextResponse) return adminOrResponse;

    const body = await req.json();
    const { vetId, isVerified } = body;

    if (!vetId || typeof isVerified !== "boolean") {
      return NextResponse.json(
        { error: "vetId and isVerified are required" },
        { status: 400 }
      );
    }

    const vetUser = await User.findById(vetId).select("email username");
    if (!vetUser) {
      return NextResponse.json(
        { error: "Veterinarian account not found" },
        { status: 404 }
      );
    }

    const update = { isActive: isVerified };

    let updatedProfile = await VetProfile.findOneAndUpdate(
      { accountUser: vetUser._id },
      update,
      { new: true }
    );

    if (!updatedProfile) {
      updatedProfile = await VetProfile.findOneAndUpdate(
        { "contact.email": vetUser.email },
        update,
        { new: true }
      );
    }

    if (!updatedProfile && isVerified) {
      updatedProfile = await VetProfile.create({
        accountUser: vetUser._id,
        name: vetUser.username || vetUser.email,
        contact: { email: vetUser.email },
        isActive: true,
      });
    }

    return NextResponse.json({
      message: "Vet verification status updated",
      data: { vetId, isVerified },
    });
  } catch (err) {
    console.error("Vet verification update error:", err);
    return NextResponse.json(
      { error: "Failed to update vet verification status" },
      { status: 500 }
    );
  }
}
