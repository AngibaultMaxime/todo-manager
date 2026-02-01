import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseIdParam } from "@/lib/utils";
import { updateUserSchema } from "@/schemas/user.schema";
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = requireAdmin(req);
    const { id } = await params;

    const userId = parseIdParam(id);
    if (userId instanceof NextResponse) return userId;

    // Empêcher de modifier son propre rôle
    if (userId == admin.userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier votre propre rôle" },
        { status: 403 },
      );
    }

    // Validation avec Zod
    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: validatedData.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
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

    console.error("PATCH user error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'utilisateur" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = requireAdmin(req);
    const { id } = await params;

    const userId = parseIdParam(id);
    if (userId instanceof NextResponse) return userId;

    // Empêcher de se supprimer soi-même
    if (userId === admin.userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous supprimer vous-même" },
        { status: 403 },
      );
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    // Si c'est un admin, vérifier qu'il reste au moins un autre admin
    if (existingUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Impossible de supprimer le dernier administrateur" },
          { status: 403 },
        );
      }
    }

    // Supprimer les todos créés par cet utilisateur
    await prisma.todo.deleteMany({
      where: { createdById: userId },
    });

    // Retirer l'assignation des todos assignés à cet utilisateur
    await prisma.todo.updateMany({
      where: { assignedToId: userId },
      data: { assignedToId: null },
    });

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Utilisateur supprimé avec succès" });
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

    console.error("DELETE user error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 },
    );
  }
}
