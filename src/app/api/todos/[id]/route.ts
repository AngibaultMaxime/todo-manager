import { requireAdmin, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTodoSchema } from "@/schemas/todo.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Vérifier l'authentification
    const user = requireAuth(req);

    // Récupérer l'ID du todo depuis les paramètres
    const { id } = await params;

    // Vérification du format de l'ID
    const todoId = parseInt(id, 10);
    if (isNaN(todoId)) {
      return NextResponse.json(
        { error: "Format d'ID invalide. Doit être un nombre entier." },
        { status: 400 },
      );
    }

    // Récupérer le todo avec les relations
    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo non trouvé" }, { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 },
      );
    }

    console.error("GET todo by ID error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du todo" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Seul l'admin peut mettre à jour des todos
    const user = requireAdmin(req);

    // Récupérer l'ID du todo depuis les paramètres
    const { id } = await params;

    // Verification du format de l'ID
    const todoId = parseInt(id, 10);
    if (isNaN(todoId)) {
      return NextResponse.json(
        { error: "Format d'ID invalide. Doit être un nombre entier." },
        { status: 400 },
      );
    }

    // Validation des données avec Zod
    const body = await req.json();
    const validatedData = updateTodoSchema.parse(body);

    // Verifier que le todo existe
    const existingTodo = await prisma.todo.findUnique({
      where: { id: todoId },
    });
    if (!existingTodo) {
      return NextResponse.json({ error: "Todo non trouvé" }, { status: 404 });
    }

    // Mettre à jour le todo
    const updateTodo = await prisma.todo.update({
      where: { id: todoId },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null, // Conversion String -> Date
        categoryId: validatedData.categoryId ?? null,
        assignedToId: validatedData.assignedToId ?? null,
      },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(updateTodo);
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

    console.error("Update todo error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du todo" },
      { status: 500 },
    );
  }
}
