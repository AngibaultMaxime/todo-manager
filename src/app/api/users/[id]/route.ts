import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseIdParam } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Seul un admin peut récupérer les informations d'un utilisateur
    const user = requireAdmin(req);

    // Récupérer l'ID de l'utilisateur depuis les paramètres
    const { id } = await params;

    // Vérification du format de l'ID
    const userId = parseIdParam(id);
    if (userId instanceof NextResponse) return userId; // Retourne userId qui est un NextResponse en cas d'erreur

    // Vérifier si l'utilisateur existe
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    return NextResponse.json(userData);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 },
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "Accès refusé. Réservé aux administrateurs." },
        { status: 403 },
      );
    }

    console.error("GET user by ID error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 },
    );
  }
}
