import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/AccountUser";

export async function GET(req: Request) {
  try {
    // Check if user is admin
    const userHeader = req.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // Get current date info
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // User growth data
    const thisMonthUsers = await User.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });

    const lastMonthUsers = await User.countDocuments({
      createdAt: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth,
      },
    });

    const growth =
      lastMonthUsers > 0
        ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
        : 0;

    // Role distribution
    const roleDistribution = {
      petOwner: await User.countDocuments({ role: "petOwner" }),
      vet: await User.countDocuments({ role: "vet" }),
      admin: await User.countDocuments({ role: "admin" }),
    };

    // Mock activity stats (in a real app, you'd track this data)
    const activityStats = {
      totalSessions: Math.floor(Math.random() * 1000) + 500,
      averageSessionTime: "12m 34s",
      peakHours: ["9:00 AM", "2:00 PM", "7:00 PM"],
    };

    return NextResponse.json({
      userGrowth: {
        thisMonth: thisMonthUsers,
        lastMonth: lastMonthUsers,
        growth,
      },
      activityStats,
      roleDistribution,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
