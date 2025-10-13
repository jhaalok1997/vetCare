import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/User";

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

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Active in last 24 hours
    });
    const totalVets = await User.countDocuments({ role: "vet" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Get recent activity (last 10 users created)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("username email role createdAt");

    const recentActivity = recentUsers.map(user => ({
      description: `New ${user.role} registered: ${user.username}`,
      timestamp: user.createdAt
    }));

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalVets,
      totalAdmins,
      recentActivity
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
