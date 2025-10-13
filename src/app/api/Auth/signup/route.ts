import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { username, email, password, role, tenantId } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default tenant + role handling
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "petOwner",          // default role
      tenantId: tenantId || email,    // fallback tenantId → could be clinic/org id later
    });

    return NextResponse.json(
      { message: "Signup successful", userId: newUser._id },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
