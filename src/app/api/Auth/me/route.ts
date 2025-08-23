import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth=([^;]+)/);

  if (!match) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const token = match[1];
    const decoded = jwt.verify(token, SECRET);
    return NextResponse.json({ user: decoded });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
