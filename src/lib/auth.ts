import { NextRequest } from "next/server";
import { JWTPayload, verifyAccessToken } from "./jwt";

// Extrait l'utilisateur depuis le token dans le header Authorization.
// Retourne null si pas de token ou token invalide.
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    return payload;
  } catch (error: any) {
    return null;
  }
}

// Vérifie si l'utilisateur est authentifié.
// Lance une erreur si non authentifié.
export function requireAuth(request: NextRequest): JWTPayload {
    const user = getUserFromRequest(request);
    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    return user;
}

// Vérifie que l'utilisateur est un ADMIN.
// Lance une erreur si non admin.
export function requireAdmin(request: NextRequest): JWTPayload {
    const user = requireAuth(request);
    if (user.role !== "ADMIN") {
      throw new Error("FORBIDDEN");
    }

    return user;
}
