import { verifyAccessToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  // Si pas de token, on laisse passer (route publique)
  if (!authHeader) {
    return NextResponse.next();
  }

  // Token mal formé
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization header invalide" },
      { status: 401 },
    );
  }

  try {
    const token = authHeader.substring(7); // Enlever "Bearer "
    const payload = verifyAccessToken(token);

    // On injecte l'utilisateur dans la requête
    const headers = new Headers(req.headers);
    headers.set("x-user", JSON.stringify(payload));

    return NextResponse.next({
      request: { headers },
    });
  } catch {
    return NextResponse.json(
      { error: "Token invalide ou expiré" },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/api/todos/:path*"],
};
