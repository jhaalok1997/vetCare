import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

// ✅ Encode JWT secret for JOSE (required for Edge Runtime)
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecret"
);

// ✅ Define custom JWT payload structure with required user properties
interface DecodedToken extends JWTPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

export async function middleware(req: NextRequest) {
  // ✅ Extract authentication token from cookies
  const token = req.cookies.get("auth")?.value;

  // ✅ Redirect to login if no token is present
  if (!token) {
    return NextResponse.redirect(new URL("/Auth/login", req.url));
  }

  try {
    // ✅ Verify JWT token using JOSE (Edge Runtime compatible)
    const { payload } = await jwtVerify(token, SECRET);
    const decoded = payload as DecodedToken;

    // ✅ Create request headers early to include user info for downstream usage
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user", JSON.stringify(decoded));

    // ✅ Get current request pathname for route-based access control
    const pathname = req.nextUrl.pathname;

    // ✅ Admin route protection - only allow users with 'admin' role
    if (pathname.startsWith("/admin")) {
      if (decoded.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Admins only" },
          { status: 403 }
        );
      }
      // ✅ Admin access granted - proceed with user headers
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
    }

    // ✅ Tenant isolation - ensure users can only access their own tenant data
    if (pathname.startsWith("/tenant/")) {
      const tenantFromUrl = pathname.split("/")[2]; // Extract tenant ID from URL
      if (tenantFromUrl && tenantFromUrl !== decoded.tenantId) {
        return NextResponse.json(
          { error: "Forbidden: Wrong tenant" },
          { status: 403 }
        );
      }
    }

    // ✅ Allow access to all other protected routes with user info in headers
    return NextResponse.next({ 
      request: { 
        headers: requestHeaders 
      } 
    });

  } catch (err) {
    // ✅ Handle JWT verification errors (expired, invalid, malformed tokens)
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/Auth/login", req.url));
  }
}

// ✅ Configure middleware to protect specific route patterns
export const config = {
  matcher: [
    "/dashboard/:path*",  // Protect all dashboard routes
    "/profile/:path*",    // Protect all profile routes
    "/admin/:path*",      // Protect all admin routes (with role check)
    "/tenant/:path*",     // Protect all tenant routes (with tenant isolation)
  ],
};
