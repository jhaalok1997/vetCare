import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/AccountUser";
import DiagnosisReport from "@/models/DiagnosisReport";
import VetMatchLog from "@/models/VetMatchLog";
import PatientOwner from "@/models/PatientOwner";

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

    // Get date ranges for statistics
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // Get diagnosis reports statistics
    const totalDiagnoses = await DiagnosisReport.countDocuments();
    const diagnosesThisMonth = await DiagnosisReport.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    const diagnosesLastMonth = await DiagnosisReport.countDocuments({
      createdAt: { $gte: twoMonthsAgo, $lt: oneMonthAgo },
    });

    // Get vet match statistics
    const totalVetMatches = await VetMatchLog.countDocuments();
    const vetMatchesThisMonth = await VetMatchLog.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    // Get user statistics
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    const activeUsersThisMonth = await User.countDocuments({
      updatedAt: { $gte: oneMonthAgo },
    });

    // Get consultation statistics (using PatientOwner as proxy)
    const totalConsultations = await PatientOwner.countDocuments();
    const consultationsThisMonth = await PatientOwner.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    const consultationsLastMonth = await PatientOwner.countDocuments({
      createdAt: { $gte: twoMonthsAgo, $lt: oneMonthAgo },
    });

    // Get recent diagnoses with details
    const recentDiagnoses = await DiagnosisReport.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("animalType symptoms report createdAt");

    // Transform recent diagnoses for frontend
    const transformedDiagnoses = recentDiagnoses.map((diagnosis) => ({
      _id: diagnosis._id,
      patientName: diagnosis.animalType || 'Unknown',
      ownerName: 'Anonymous', // If you have owner data, include it here
      diagnosis: diagnosis.report || 'N/A',
      symptoms: diagnosis.symptoms || 'N/A',
      createdAt: diagnosis.createdAt,
    }));

    return NextResponse.json({
      summary: {
        diagnoses: {
          total: totalDiagnoses,
          thisMonth: diagnosesThisMonth,
          lastMonth: diagnosesLastMonth,
        },
        consultations: {
          total: totalConsultations,
          thisMonth: consultationsThisMonth,
          lastMonth: consultationsLastMonth,
        },
        users: {
          newThisMonth: newUsersThisMonth,
          activeThisMonth: activeUsersThisMonth,
        },
        vetMatches: {
          total: totalVetMatches,
          thisMonth: vetMatchesThisMonth,
        },
      },
      recentDiagnoses: transformedDiagnoses,
    });
  } catch (error) {
    console.error("Reports fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

