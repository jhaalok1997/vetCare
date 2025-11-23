import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/AccountUser";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // ✅ Payload includes tenantId & role
    // Admin gets longer session duration
    const tokenExpiry = user.role === "admin" ? "24h" : "1h";

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || "petOwner",
        tenantId: user.tenantId, // 👈 crucial for tenant isolation
      },
      SECRET,
      { expiresIn: tokenExpiry }
    );

    const res = NextResponse.json({
      message: "Login successful",
      token: token, // Include token in response for client-side handling
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });

    // ✅ Strong cookie settings with longer duration for admin
    const cookieMaxAge = user.role === "admin" ? 24 * 60 * 60 : 60 * 60; // 24h for admin, 1h for others

    res.cookies.set("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use HTTPS in prod
      sameSite: "lax",
      maxAge: cookieMaxAge,
      path: "/",
    });

    return res;
  } catch (error: unknown) {
    console.error("Login error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
