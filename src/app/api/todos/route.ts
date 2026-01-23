import { requireAdmin, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTodoSchema } from "@/schemas/todo.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = requireAuth(req);

    // Récupérer les todos avec les relations
    const todos = await prisma.todo.findMany({
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" }, // Plus récent en premier
    });

    return NextResponse.json(todos);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 },
      );
    }

    console.error("GET todos error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des todos" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Seul l'admin peut créer des todos
    const user = requireAdmin(req);

    // Validation des données avec Zod
    const body = await req.json();
    const validatedData = createTodoSchema.parse(body);

    // Créer le todo
    const todo = await prisma.todo.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null, // Conversion String -> Date
        categoryId: validatedData.categoryId ?? null,
        createdById: user.userId,
        assignedToId: validatedData.assignedToId ?? null,
      },
      include: {
        category: true,
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(todo, { status: 201 });
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

    console.error("Creation todo error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du todo" },
      { status: 500 },
    );
  }
}
