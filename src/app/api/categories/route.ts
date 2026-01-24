import { requireAdmin, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCategorySchema } from "@/schemas/category.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = requireAuth(req);

    // Récupérer les catégories
    const categories = await prisma.category.findMany();

    return NextResponse.json(categories);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 },
      );
    }

    console.error("GET categories error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Seul l'admin peut créer des catégories
    const user = requireAdmin(req);

    // Validation des données avec Zod
    const body = await req.json();
    const validatedData = createCategorySchema.parse(body);

    // Créer la catégorie
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        color: validatedData.color ?? null,
      },
    });

    return NextResponse.json(category, { status: 201 });
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

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Creation category error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 },
    );
  }
}
