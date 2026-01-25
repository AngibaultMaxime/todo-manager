import { requireAdmin, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTodoSchema } from "@/schemas/todo.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = requireAuth(req);

    // Récupérer les paramètres de recherche
    const searchParams = req.nextUrl.searchParams;

    // Pagination (avec valeurs par défaut)
    let page = parseInt(searchParams.get("page") || "1");
    let limit = parseInt(searchParams.get("limit") || "10");

    // Filtres
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const categoryId = searchParams.get("categoryId");
    const assignedToId = searchParams.get("assignedToId");
    const search = searchParams.get("search");

    // Déclaration dynamique du "where"
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (assignedToId) {
      where.assignedToId = parseInt(assignedToId);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Validation des paramètres
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    // Calcul de l'offset. Utilisé pour savoir où commencer la récupération.
    // exemple: page 3 avec limit 10 => offset 20 (car on veut sauter les 20 premiers résultats pour afficher la page 3).
    const skip = (page - 1) * limit;

    // Récupérer les todos avec pagination et les relations
    const todos = await prisma.todo.findMany({
      where,
      skip, // Saute les 'skip' premiers résultats
      take: limit, // Prend les 'limit' résultats suivants
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

    // Compter le nombre TOTAL de todos (sans pagination)
    // Afin de pouvoir calculer le nombre total de pages côté client.
    const totalItems = await prisma.todo.count({ where });
    const totalPages = Math.ceil(totalItems / limit); // Arrondi au nombre supérieur

    // Retourner les todos avec les informations de pagination
    return NextResponse.json({
      todos,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
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
