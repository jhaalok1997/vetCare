import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/User";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // ✅ Payload includes tenantId & role
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || "owner",
        tenantId: user.tenantId, // 👈 crucial for tenant isolation
      },
      SECRET,
      { expiresIn: "1h" }
    );

    const res = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });

    // ✅ Strong cookie settings
    res.cookies.set("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use HTTPS in prod
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
