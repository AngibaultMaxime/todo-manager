import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = requireAuth(req);
        const { id } = await params;
        const todoId = parseInt(id, 10);

        if (isNaN(todoId)) {
            return NextResponse.json(
                { error: "Format ID de todo invalide" },
                { status: 400 },
            );
        }

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
            return NextResponse.json(
                { error: "Todo non trouvé" },
                { status: 404 },
            );
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