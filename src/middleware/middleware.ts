import { verifyAccessToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  // Verification de l'authentification
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Utilisateur non authentifié ou header invalide" },
      { status: 401 }
    );
  }

  try {
    const token = authHeader.substring(7);
    verifyAccessToken(token); // juste pour valider le token
    return NextResponse.next(); // token OK → continue
  } catch {
    return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/todos/:path*"], // routes protégées
};
