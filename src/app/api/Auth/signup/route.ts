import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const users: { email: string; password: string }[] = []; // 🛑 Replace with DB in prod

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email & password required" }, { status: 400 });
  }

  // check existing
  if (users.find(u => u.email === email)) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });

  return NextResponse.json({ message: "Signup successful" }, { status: 201 });
}
