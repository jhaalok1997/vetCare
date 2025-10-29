import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/AccountUser";

export async function GET(req: Request) {
  try {
    // Connect to database first
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

    if (!user.role) {
      return NextResponse.json(
        { error: "Invalid user data - No role specified" },
        { status: 400 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Log connection status and counts for debugging
    console.log("Database connection status: Connected");
    const userCount = await User.countDocuments();
    console.log("Total users in database:", userCount);

    // Get basic user statistics
    const totalUsers = await User.countDocuments();
    const totalPetOwners = await User.countDocuments({ role: "petOwner" });
    const totalVets = await User.countDocuments({ role: "vet" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Get user activity statistics
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const activeUsers24h = await User.countDocuments({
      updatedAt: { $gte: twentyFourHoursAgo },
    });

    const activeUsers7d = await User.countDocuments({
      updatedAt: { $gte: sevenDaysAgo },
    });

    const activeUsers30d = await User.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo },
    });

    // Get user growth statistics
    const newUsers24h = await User.countDocuments({
      createdAt: { $gte: twentyFourHoursAgo },
    });

    const newUsers7d = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const newUsers30d = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get recent registrations with more details
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("username email role createdAt tenantId");

    // Transform for frontend consumption
    const recentActivity = recentUsers.map((user) => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      timestamp: user.createdAt,
      action: "registration",
    }));

    // Calculate percentages
    const roleDistribution = {
      petOwners: {
        count: totalPetOwners,
        percentage: ((totalPetOwners / totalUsers) * 100).toFixed(2),
      },
      vets: {
        count: totalVets,
        percentage: ((totalVets / totalUsers) * 100).toFixed(2),
      },
      admins: {
        count: totalAdmins,
        percentage: ((totalAdmins / totalUsers) * 100).toFixed(2),
      },
    };

    // Get user growth data for the last 7 days
    const growthData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      });
      growthData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }

    // Calculate growth percentage
    const lastWeekUsers = await User.countDocuments({
      createdAt: { $lt: sevenDaysAgo },
    });
    const growthPercentage = lastWeekUsers > 0 
      ? (((totalUsers - lastWeekUsers) / lastWeekUsers) * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalPetOwners,
        totalVets,
        totalAdmins,
        roleDistribution,
      },
      activity: {
        last24Hours: {
          activeUsers: activeUsers24h,
          newRegistrations: newUsers24h,
        },
        last7Days: {
          activeUsers: activeUsers7d,
          newRegistrations: newUsers7d,
        },
        last30Days: {
          activeUsers: activeUsers30d,
          newRegistrations: newUsers30d,
        },
      },
      recentActivity,
      growthData,
      growthPercentage,
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
