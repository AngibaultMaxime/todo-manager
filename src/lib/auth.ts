import { NextRequest } from "next/server";
import { JWTPayload } from "./jwt";

function getUser(req: NextRequest): JWTPayload | null {
  const raw = req.headers.get("x-user");
  return raw ? (JSON.parse(raw) as JWTPayload) : null;
}

export function requireAuth(req: NextRequest): JWTPayload {
  const user = getUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function requireAdmin(req: NextRequest): JWTPayload {
  const user = requireAuth(req);
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
