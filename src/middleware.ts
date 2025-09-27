import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose';

const SECRET = process.env.JWT_SECRET || "supersecret";

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/Auth/login", req.url));
  }

  try {
    // Create a secret key for JWT verification
    const secretKey = new TextEncoder().encode(SECRET);
    
    // ✅ Verify and decode token using jose
    const { payload } = await jose.jwtVerify(token, secretKey);
    const decoded = payload as unknown as DecodedToken;
    
    // console.log("JWT Verification Success:", {
    //   role: decoded.role,
    //   email: decoded.email,
    //   path: req.nextUrl.pathname
    // });
    
    // ✅ Add user info into headers for downstream usage
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user", JSON.stringify(decoded));

    // RBAC rules
    const pathname = req.nextUrl.pathname;

    // ✅ Admin routes
    if (pathname.startsWith("/admin")) {
      // console.log("Checking admin access:", {
      //   userRole: decoded.role,
      //   requiredRole: "admin",
      //   isAdmin: decoded.role === "admin"
      // });
      
      if (decoded.role !== "admin") {
       // console.log("Access denied: Non-admin user attempting to access admin route");
        // Redirect non-admin users to home page instead of showing error
        return NextResponse.redirect(new URL("/", req.url));
      }
     // console.log("Admin access granted");
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
