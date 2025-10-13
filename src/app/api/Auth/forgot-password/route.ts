import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoDb";
import User from "@/models/User";
import crypto from "crypto-js";
import {transporter} from "@/lib/nodeMailer";
import { mailOptions } from "@/lib/nodeMailer";


export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.lib.WordArray.random(32).toString();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Save token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = tokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail(mailOptions(email, resetUrl));

    return NextResponse.json({
      message: "Password reset link sent to your email",
    });
  } catch (error: unknown) {
    console.error("Password reset error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process password reset';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
