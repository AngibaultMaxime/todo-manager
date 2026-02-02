import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth.schema";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation avec Zod
    const validatedData = loginSchema.parse(body);

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 },
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 },
      );
    }

    // Générer les tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Sauvegarder le refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    return response;
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la connexion",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
