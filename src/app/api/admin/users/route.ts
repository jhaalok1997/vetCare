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

    // Get all users with their details
    const users = await User.find()
      .select("username email role createdAt tenantId")
      .sort({ createdAt: -1 });

    // Add activity status (simplified - consider user as active if created in last 7 days)
    const usersWithActivity = users.map(user => ({
      ...user.toObject(),
      lastLogin: user.createdAt, // Using createdAt as lastLogin for now
      isActive: new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }));

    // Calculate statistics
    const stats = {
      total: users.length,
      active: usersWithActivity.filter(u => u.isActive).length,
      inactive: usersWithActivity.filter(u => !u.isActive).length,
      byRole: {
        petOwner: users.filter(u => u.role === "petOwner").length,
        vet: users.filter(u => u.role === "vet").length,
        admin: users.filter(u => u.role === "admin").length,
      }
    };

    return NextResponse.json({
      users: usersWithActivity,
      stats
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
