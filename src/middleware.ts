import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    jwt.verify(token, SECRET);
    return NextResponse.next(); // ✅ allow
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// protect specific routes
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // example protected pages
};
