import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/AccountUser";
import VetProfile from "@/models/VetProfile";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AdminUser {
  role: string;
  // allow other properties but we only care about role
  [key: string]: unknown;
}

const SECRET = process.env.JWT_SECRET || "supersecret";

interface AdminJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

async function requireAdmin(req: Request): Promise<AdminUser | NextResponse> {
  // First, try to read admin info from the x-user header (used by the admin UI)
  const userHeader = req.headers.get("x-user");

  if (userHeader) {
    try {
      const user = JSON.parse(userHeader) as AdminUser;
      if (user.role === "admin") {
        return user;
      }
      // If role is present but not admin, treat as forbidden
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    } catch (e) {
      console.error("Failed to parse user header:", e);
      // Fall through to cookie-based auth below
    }
  }

  // Fallback: verify admin from JWT in auth cookie, same as vet dashboard flow
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized - No user information found" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, SECRET) as AdminJwtPayload;
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    return {
      role: decoded.role,
      id: decoded.id,
      email: decoded.email,
      tenantId: decoded.tenantId,
    };
  } catch (e) {
    console.error("Failed to verify admin token:", e);
    return NextResponse.json(
      { error: "Invalid or expired admin token" },
      { status: 401 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    // Check if user is admin
    const adminOrResponse = await requireAdmin(req);
    if (adminOrResponse instanceof NextResponse) {
      return adminOrResponse;
    }

    // Get all veterinarians from User model
    const vets = await User.find({ role: "vet" })
      .select("username email phone createdAt updatedAt")
      .sort({ createdAt: -1 });

    // Get VetProfile data
    const vetProfiles = await VetProfile.find()
      .populate("animalExpertise")
      .populate("diseaseExpertise")
      .sort({ createdAt: -1 });

    // Combine the data - merge vet users with their profiles
    const combinedVetData = vets.map((vet) => {
      const profile = vetProfiles.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) =>
          p.accountUser?.toString?.() === vet._id.toString() ||
          p.contact?.email === vet.email
      );

      const isVerified = Boolean(profile?.isActive);

      return {
        _id: vet._id,
        username: vet.username,
        email: vet.email,
        phone: vet.phone || profile?.contact?.phone,
        specialization: profile?.tags?.join(", ") || "General Practice",
        licenseNumber: profile?.qualifications || "N/A",
        clinicName: profile?.name || "N/A",
        address: profile?.contact?.location || "N/A",
        isVerified,
        createdAt: vet.createdAt,
        status: isVerified ? "active" : "inactive",
      };
    });

    return NextResponse.json({
      vets: combinedVetData,
      total: combinedVetData.length,
      verified: combinedVetData.filter((v) => v.isVerified).length,
      unverified: combinedVetData.filter((v) => !v.isVerified).length,
    });
  } catch (error) {
    console.error("Vet profiles fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vet profiles" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();

    // Check if user is admin
    const adminOrResponse = await requireAdmin(req);
    if (adminOrResponse instanceof NextResponse) {
      return adminOrResponse;
    }

    const body = await req.json();
    const { vetId, isVerified } = body as {
      vetId?: string;
      isVerified?: boolean;
    };

    if (!vetId || typeof isVerified !== "boolean") {
      return NextResponse.json(
        { error: "vetId and isVerified are required" },
        { status: 400 }
      );
    }

    // Try to find profile by accountUser first, then by contact.email if needed
    const vetUser = await User.findById(vetId).select("email username");
    if (!vetUser) {
      return NextResponse.json(
        { error: "Veterinarian account not found" },
        { status: 404 }
      );
    }

    const update = { isActive: isVerified };

    let updatedProfile =
      (await VetProfile.findOneAndUpdate(
        { accountUser: vetUser._id },
        update,
        { new: true }
      )) ||
      (await VetProfile.findOneAndUpdate(
        { "contact.email": vetUser.email },
        update,
        { new: true }
      ));

    // If no profile exists yet:
    // - When verifying (isVerified === true), create a minimal VetProfile and mark it active.
    // - When un-verifying and no profile exists, treat it as a no-op but still succeed.
    if (!updatedProfile) {
      if (isVerified) {
        updatedProfile = await VetProfile.create({
          accountUser: vetUser._id,
          name: vetUser.username || vetUser.email,
          contact: {
            email: vetUser.email,
          },
          isActive: true,
        });
      } else {
        // Nothing to deactivate, but the system already treats absence of a profile as "not verified".
        return NextResponse.json({
          message:
            "No vet profile existed; status remains unverified and no profile was created.",
          data: {
            vetId,
            isVerified: false,
          },
        });
      }
    }

    return NextResponse.json({
      message: "Vet verification status updated successfully",
      data: {
        vetId,
        isVerified,
      },
    });
  } catch (error) {
    console.error("Vet verification update error:", error);
    return NextResponse.json(
      { error: "Failed to update vet verification status" },
      { status: 500 }
    );
  }
}

