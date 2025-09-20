import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/User";
import { JwtPayload } from "jsonwebtoken";

interface UserJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth=([^;]+)/);

    if (!match) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = match[1];
    let decoded: UserJwtPayload;

    try {
      decoded = jwt.verify(token, SECRET) as UserJwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ _id: decoded.id }).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Return complete user info matching token structure
    return NextResponse.json({ 
      user: { 
        id: user._id,
        username: user.username, 
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      } 
    });
  } catch (error) {
    console.error("❌ /auth/profile error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
