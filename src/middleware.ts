import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

interface DecodedToken extends JwtPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // ✅ Decode token
    const decoded = jwt.verify(token, SECRET) as DecodedToken;
    
    // ✅ Add user info into headers for downstream usage
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user", JSON.stringify(decoded));

    // RBAC rules
    const pathname = req.nextUrl.pathname;

    // ✅ Admin routes
    if (pathname.startsWith("/admin")) {
      if (decoded.role !== "admin") {
        // Redirect non-admin users to home page instead of showing error
        return NextResponse.redirect(new URL("/", req.url));
      }
      // Allow admin users to proceed to admin routes
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
    }

    // ✅ Tenant isolation (example: /tenant/[tenantId]/...)
    if (pathname.startsWith("/tenant/")) {
      const tenantFromUrl = pathname.split("/")[2];
      if (tenantFromUrl && tenantFromUrl !== decoded.tenantId) {
        return NextResponse.json({ error: "Forbidden: Wrong tenant" }, { status: 403 });
      }
    }

    return NextResponse.next({
      request: { 
        headers: requestHeaders 
      }
    });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// ✅ Protect routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",    // protect admin
    "/tenant/:path*",   // protect tenant routes
    "/veterinarian/:path*",  // protect veterinarian routes
  ],
};
