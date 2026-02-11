import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import type { VetJwtPayload } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function extractTokenFromRequest(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth=([^;]+)/);
  return match ? match[1] : null;
}

export function verifyVetToken(token: string): VetJwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as VetJwtPayload;
  if (decoded.role !== "vet") {
    throw new Error("Forbidden - veterinarian role required");
  }
  return decoded;
}
