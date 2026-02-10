import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

// ✅ Encode JWT secret for JOSE
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecret",
);

// ✅ Define custom JWT payload structure with required user properties
interface DecodedToken extends JWTPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

const PUBLIC_FILE = /\.(.*)$/;
const PUBLIC_PATH_PREFIXES = ["/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml"];
const AUTH_PAGES = ["/Auth/login", "/Auth/signup", "/Auth/reset-password"];
const AUTH_APIS = [
  "/api/Auth/login",
  "/api/Auth/signup",
  "/api/Auth/forgot-password",
  "/api/Auth/reset-password",
  "/api/Auth/logout",
];

function isPublicPath(pathname: string) {
  if (PUBLIC_FILE.test(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((route) => pathname.startsWith(route));
}

function isAuthApi(pathname: string) {
  return AUTH_APIS.some((route) => pathname.startsWith(route));
}

function getRoleLanding(role?: string) {
  if (role === "admin") return "/admin";
  if (role === "vet") return "/veterinarian/Dashboard";
  return "/";
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // ✅ Extract authentication token from cookies
  const token = req.cookies.get("auth")?.value;

  // ✅ Allow auth pages/APIs without auth (but redirect away if already signed in)
  if (isAuthPage(pathname) || isAuthApi(pathname)) {
    if (token && isAuthPage(pathname)) {
      try {
        const { payload } = await jwtVerify(token, SECRET);
        const decoded = payload as DecodedToken;
        return NextResponse.redirect(new URL(getRoleLanding(decoded.role), req.url));
      } catch {
        // Invalid token: allow user to reach auth page
      }
    }
    return NextResponse.next();
  }

  // ✅ No token: block API or redirect UI to login
  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/Auth/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
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
          { status: 403 },
        );
      }
      // ✅ Admin access granted - proceed with user headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    if (pathname.startsWith("/veterinarian")) {
      if (decoded.role !== "vet") {
        return NextResponse.json(
          { error: "Forbidden: Vet only" },
          { status: 403 },
        );
      }
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // ✅ Tenant isolation - ensure users can only access their own tenant data
    if (pathname.startsWith("/tenant/")) {
      const tenantFromUrl = pathname.split("/")[2]; // Extract tenant ID from URL
      if (tenantFromUrl && tenantFromUrl !== decoded.tenantId) {
        return NextResponse.json(
          { error: "Forbidden: Wrong tenant" },
          { status: 403 },
        );
      }
    }

    // ✅ Allow access to all other protected routes with user info in headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    // ✅ Handle JWT verification errors (expired, invalid, malformed tokens)
    console.error("JWT verification failed:", err);
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/Auth/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// ✅ Configure middleware to protect specific route patterns
export const config = {
  matcher: ["/:path*"],
};
