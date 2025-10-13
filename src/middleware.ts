import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecret"
);

interface DecodedToken extends JWTPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // ✅ Verify token using JOSE
    const { payload } = await jwtVerify(token, SECRET);
    const decoded = payload as DecodedToken;

    // RBAC rules
    const pathname = req.nextUrl.pathname;

    // ✅ Admin routes
    if (pathname.startsWith("/admin")) {
      if (decoded.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Admins only" },
          { status: 403 }
        );
      }
    }

    // ✅ Tenant isolation
    if (pathname.startsWith("/tenant/")) {
      const tenantFromUrl = pathname.split("/")[2];
      if (tenantFromUrl && tenantFromUrl !== decoded.tenantId) {
        return NextResponse.json(
          { error: "Forbidden: Wrong tenant" },
          { status: 403 }
        );
      }
    }

    // ✅ Add user info to headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user", JSON.stringify(decoded));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/tenant/:path*",
  ],
};
