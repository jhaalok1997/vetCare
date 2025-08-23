import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret"; // put in .env

const users: { email: string; password: string }[] = []; // same as signup

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = users.find(u => u.email === email);

  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = jwt.sign({ email }, SECRET, { expiresIn: "1h" });

  const res = NextResponse.json({ message: "Login successful" });
  res.cookies.set("auth", token, { httpOnly: true, maxAge: 3600, path: "/" });

  return res;
}
