import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { todo } from "node:test";

export async function GET(req: NextRequest) {
  try {
    // Seul l'admin peut accéder aux statistiques
    const user = requireAdmin(req);

    // Compter le total de todos
    const totalTodos = await prisma.todo.count();

    // Compter le total des utilisateurs
    const totalUsers = await prisma.user.count();

    // Compter le total de catégories
    const totalCategories = await prisma.category.count();

    // Grouper les todos par status et compter
    const todosByStatusRaw = await prisma.todo.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // Transformer en objet { TODO: 10, IN_PROGRESS: 5, ... }
    const todosByStatus = todosByStatusRaw.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Grouper les todos par priorité et compter
    const todosByPriorityRaw = await prisma.todo.groupBy({
      by: ["priority"],
      _count: { id: true },
    });

    const todosByPriority = todosByPriorityRaw.reduce(
      (acc, item) => {
        acc[item.priority] = item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Récupérer les 5 todos les plus récents
    const recentTodos = await prisma.todo.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, color: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Compter les todos par catégorie
    const todosByCategoryRaw = await prisma.todo.groupBy({
      by: ["categoryId"],
      _count: { id: true },
    });

    // Récupérer les noms des catégories
    const categoriesWithCount = await Promise.all(
      todosByCategoryRaw.map(async (item) => {
        if (!item.categoryId) {
          return { name: "Sans catégorie", count: item._count.id };
        }
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true },
        });
        return {
          name: category?.name || "Inconnue",
          count: item._count.id,
        };
      }),
    );

    // Retourner toutes les statistiques
    return NextResponse.json({
      totals: {
        todos: totalTodos,
        users: totalUsers,
        categories: totalCategories,
      },
      todosByStatus,
      todosByPriority,
      todosByCategory: categoriesWithCount,
      recentTodos,
    });
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

    console.error("GET dashboard stats error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 },
    );
  }
}
