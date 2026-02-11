import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import { extractTokenFromRequest, verifyVetToken } from "./_lib/auth";
import { buildDiagnosisByAnimalType, buildMatchLogAppointments, buildNewModelAppointments, buildPatientSummaries, buildUpcomingAppointments, mapRecentMessages } from "./_lib/mappers";
import { getAccountUser, getDashboardCollections, getMessageSummary, getVetProfile, resolveVetAccountObjectId } from "./_lib/queries";
import type { VetJwtPayload } from "./_lib/types";

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

    const vetAccountObjectId = resolveVetAccountObjectId(vetUser);
    const accountUser = await getAccountUser(vetUser, vetAccountObjectId);
    const vetProfile = await getVetProfile(vetUser, vetAccountObjectId);

    if (!vetProfile) {
      return NextResponse.json(
        {
          error: "Vet profile not found for the logged-in account.",
          needsProfile: true,
        },
        { status: 404 }
      );
    }

    const isVerified = Boolean(vetProfile.isActive);
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      { unreadMessages, recentMessages },
      {
        uniquePatientIds,
        todaysMatchLogsCount,
        newConsultationsCount,
        matchLogs,
        recentDiagnosisReports,
        newAppointments,
        todaysNewAppointmentsCount,
      },
    ] = await Promise.all([
      getMessageSummary(),
      getDashboardCollections({
        vetProfileId: vetProfile._id,
        isVerified,
        vetUser,
        startOfToday,
        endOfToday,
        sevenDaysAgo,
      }),
    ]);

    const todaysAppointmentsCount = todaysMatchLogsCount + todaysNewAppointmentsCount;

    const diagnosisByAnimalType = buildDiagnosisByAnimalType(recentDiagnosisReports);

    const matchLogAppointments = buildMatchLogAppointments(matchLogs, startOfToday);
    const newModelAppointments = buildNewModelAppointments(newAppointments, startOfToday);
    const upcomingAppointments = buildUpcomingAppointments(
      matchLogAppointments,
      newModelAppointments
    );
    const patientSummaries = buildPatientSummaries(matchLogs, diagnosisByAnimalType);

    return NextResponse.json({
      overview: {
        totalPatients: uniquePatientIds.filter(Boolean).length,
        todaysAppointments: todaysAppointmentsCount,
        newConsultations: newConsultationsCount,
        unreadMessages,
      },
      appointments: upcomingAppointments,
      patients: patientSummaries,
      messages: mapRecentMessages(recentMessages),
      meta: {
        vetProfile: {
          id: vetProfile._id.toString(),
          // Prefer explicit VetProfile name; fall back to account username; then to email
          name:
            vetProfile.name ||
            accountUser?.username ||
            vetProfile.contact?.email ||
            accountUser?.email ||
            vetUser.email,
          email: vetProfile.contact?.email || accountUser?.email || vetUser.email,
          isVerified,
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

