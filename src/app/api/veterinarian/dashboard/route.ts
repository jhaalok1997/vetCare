import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoDb";
import VetProfile from "@/models/VetProfile";
import VetMatchLog from "@/models/VetMatchLog";
import DiagnosisReport from "@/models/DiagnosisReport";
import ContactedUser from "@/models/ContactedUser";
import AccountUser from "@/models/AccountUser";

const SECRET = process.env.JWT_SECRET || "supersecret";

const isFilterClause = <T>(value: T | null | undefined): value is T => Boolean(value);

interface VetJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

type VetProfileLean = {
  _id: mongoose.Types.ObjectId;
  name: string;
  contact?: {
    email?: string;
  };
  isActive?: boolean;
};

function extractTokenFromRequest(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth=([^;]+)/);
  return match ? match[1] : null;
}

function verifyVetToken(token: string): VetJwtPayload {
  const decoded = jwt.verify(token, SECRET) as VetJwtPayload;
  if (decoded.role !== "vet") {
    throw new Error("Forbidden - veterinarian role required");
  }
  return decoded;
}

export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let vetUser: VetJwtPayload;
    try {
      vetUser = verifyVetToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await connectDB();

    const vetAccountObjectId =
      vetUser.id && mongoose.Types.ObjectId.isValid(vetUser.id)
        ? new mongoose.Types.ObjectId(vetUser.id)
        : null;

    // Fetch account user to get the login username for display in the dashboard header
    let accountUser: { username?: string; email?: string } | null = null;
    if (vetAccountObjectId) {
      accountUser = await AccountUser.findById(vetAccountObjectId)
        .select("username email")
        .lean<{ username?: string; email?: string }>();
    } else if (vetUser.email) {
      accountUser = await AccountUser.findOne({ email: vetUser.email })
        .select("username email")
        .lean<{ username?: string; email?: string }>();
    }

    const profileOrClauses = [
      vetAccountObjectId ? { accountUser: vetAccountObjectId } : null,
      vetUser.email ? { "contact.email": vetUser.email } : null,
    ].filter(isFilterClause);

    const vetProfile = await VetProfile.findOne(
      profileOrClauses.length
        ? { $or: profileOrClauses }
        : { "contact.email": vetUser.email }
    )
      .select("_id name contact isActive")
      .lean<VetProfileLean>();

    if (!vetProfile) {
      return NextResponse.json(
        {
          error: "Vet profile not found for the logged-in account.",
          needsProfile: true,
        },
        { status: 404 }
      );
    }

    const vetProfileId = vetProfile._id;
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const vetMatchFilter = { matchedVet: vetProfileId };

    const [
      uniquePatientIds,
      todaysAppointmentsCount,
      newConsultationsCount,
      matchLogs,
      recentDiagnosisReports,
    ] = await Promise.all([
      VetMatchLog.distinct<string>("animalType", vetMatchFilter),
      VetMatchLog.countDocuments({
        ...vetMatchFilter,
        appointmentDate: { $gte: startOfToday, $lte: endOfToday },
      }),
      VetMatchLog.countDocuments({
        ...vetMatchFilter,
        appointmentDate: { $gte: sevenDaysAgo },
      }),
      VetMatchLog.find(vetMatchFilter)
        .populate("animalType")
        .populate("diseaseCategory")
        .sort({ appointmentDate: 1 })
        .limit(50)
        .lean(),
      DiagnosisReport.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    const diagnosisByAnimalType = new Map<string, (typeof recentDiagnosisReports)[number]>();
    recentDiagnosisReports.forEach((diagnosis) => {
      if (!diagnosis.animalType) return;
      const key = String(diagnosis.animalType).toLowerCase();
      if (!diagnosisByAnimalType.has(key)) {
        diagnosisByAnimalType.set(key, diagnosis);
      }
    });

    const upcomingAppointments = matchLogs
      .filter((log) => {
        const appointmentDate = log.appointmentDate ?? log.timestamp;
        return appointmentDate && appointmentDate >= startOfToday;
      })
      .sort((a, b) => {
        const aDate = (a.appointmentDate ?? a.timestamp ?? new Date()).getTime();
        const bDate = (b.appointmentDate ?? b.timestamp ?? new Date()).getTime();
        return aDate - bDate;
      })
      .slice(0, 6)
      .map((log) => {
        const animal = log.animalType as {
          _id?: mongoose.Types.ObjectId;
          petName?: string;
          animalType?: string;
        };
        const disease = log.diseaseCategory as {
          DiseaseType?: string;
          UrgencyLevel?: string;
        };

        return {
          id: log._id?.toString() ?? "",
          patientName: animal?.petName || "Unknown patient",
          species: animal?.animalType || "Unknown",
          condition: disease?.DiseaseType || "General consultation",
          urgency: disease?.UrgencyLevel || "Low",
          scheduledFor: log.appointmentDate ?? log.timestamp,
          status: log.status,
        };
      });

    const patientSummaries: Array<{
      id: string;
      name: string;
      species: string | undefined;
      age: number | undefined;
      breed?: string;
      lastVisit: Date | undefined;
      condition: string;
      urgency: string;
      latestDiagnosisSnippet: string | null;
    }> = [];

    const seenPatients = new Set<string>();
    for (const log of [...matchLogs].sort((a, b) => {
      const aDate = (a.appointmentDate ?? a.timestamp ?? new Date()).getTime();
      const bDate = (b.appointmentDate ?? b.timestamp ?? new Date()).getTime();
      return bDate - aDate;
    })) {
      const animal = log.animalType as {
        _id?: mongoose.Types.ObjectId;
        petName?: string;
        animalType?: string;
        petAge?: number;
        petBreed?: string;
      };
      if (!animal?._id) continue;
      const animalId = animal._id.toString();
      if (seenPatients.has(animalId)) continue;
      seenPatients.add(animalId);

      const disease = log.diseaseCategory as {
        DiseaseType?: string;
        UrgencyLevel?: string;
      };

      const diagnosisKey = animal.animalType?.toLowerCase();
      const relatedDiagnosis = diagnosisKey ? diagnosisByAnimalType.get(diagnosisKey) : null;

      patientSummaries.push({
        id: animalId,
        name: animal.petName || "Unnamed patient",
        species: animal.animalType,
        age: animal.petAge,
        breed: animal.petBreed,
        lastVisit: log.appointmentDate ?? log.timestamp,
        condition: disease?.DiseaseType || "General check-up",
        urgency: disease?.UrgencyLevel || "Low",
        latestDiagnosisSnippet: relatedDiagnosis?.report
          ? String(relatedDiagnosis.report).slice(0, 200)
          : null,
      });

      if (patientSummaries.length >= 10) break;
    }

    // ContactedUser currently has only Name, email, message, timestamps.
    // For vets, we surface global contact messages (no per-vet assignment yet).
    const unreadMessages = await ContactedUser.countDocuments();

    const recentMessages = await ContactedUser.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return NextResponse.json({
      overview: {
        totalPatients: uniquePatientIds.filter(Boolean).length,
        todaysAppointments: todaysAppointmentsCount,
        newConsultations: newConsultationsCount,
        unreadMessages,
      },
      appointments: upcomingAppointments,
      patients: patientSummaries,
      messages: recentMessages.map((msg) => ({
        id: msg._id?.toString() ?? "",
        name: msg.Name,
        email: msg.email,
        message: msg.message,
        status: "new",
        receivedAt: msg.createdAt,
      })),
      meta: {
        vetProfile: {
          id: vetProfileId.toString(),
          // Prefer explicit VetProfile name; fall back to account username; then to email
          name:
            vetProfile.name ||
            accountUser?.username ||
            vetProfile.contact?.email ||
            accountUser?.email ||
            vetUser.email,
          email: vetProfile.contact?.email || accountUser?.email || vetUser.email,
          isVerified: Boolean(vetProfile.isActive),
        },
        totals: {
          consultationsTracked: matchLogs.length,
        },
      },
    });
  } catch (error) {
    console.error("Vet dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch veterinarian dashboard data" },
      { status: 500 }
    );
  }
}

