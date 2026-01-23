import { NextRequest } from "next/server";
import { JWTPayload, verifyAccessToken } from "./jwt";

function getUser(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.substring(7);
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): JWTPayload {
  const user = getUser(req);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function requireAdmin(req: NextRequest): JWTPayload {
  const user = requireAuth(req);
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
