import { requireAdmin, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseIdParam } from "@/lib/utils";
import { updateCategorySchema } from "@/schemas/category.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verifier l'authentification
    const user = requireAuth(req);

    // Récupérer l'ID de la catégorie depuis les paramètres
    const { id } = await params;

    // Vérification du format de l'ID
    const categoryId = parseIdParam(id);
    if (categoryId instanceof NextResponse) return categoryId; // Retourne categoryId qui est un NextResponse en cas d'erreur

    // Récupérer la catégorie
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 },
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 },
      );
    }

    console.error("GET category by ID error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la catégorie" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Seul l'admin peut mettre à jour une catégorie
    const user = requireAdmin(req);

    // Récupérer l'ID de la catégorie depuis les paramètres
    const { id } = await params;

    // Vérification du format de l'ID
    const categoryId = parseIdParam(id);
    if (categoryId instanceof NextResponse) return categoryId; // Retourne categoryId qui est un NextResponse en cas d'erreur

    // Validation des données avec Zod
    const body = await req.json();
    const validatedData = updateCategorySchema.parse(body);

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 },
      );
    }

    // Mettre à jour la catégorie
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.color !== undefined && {
          color: validatedData.color,
        }),
      },
    });

    return NextResponse.json(updatedCategory);
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

    console.error("PATCH category by ID error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la catégorie" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Seul l'admin peut supprimer une catégorie
    const user = requireAdmin(req);

    // Récupérer l'ID de la catégorie depuis les paramètres
    const { id } = await params;

    // Vérification du format de l'ID
    const categoryId = parseIdParam(id);
    if (categoryId instanceof NextResponse) return categoryId; // Retourne categoryId qui est un NextResponse en cas d'erreur

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 },
      );
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: "Catégorie supprimée avec succès" });
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

    console.error("DELETE category by ID error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la catégorie" },
      { status: 500 },
    );
  }
}
