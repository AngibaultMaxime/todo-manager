import { NextResponse } from "next/server";

export function parseIdParam(id: string): number | NextResponse {
  const parseId = parseInt(id, 10);

  if (isNaN(parseId)) {
    return NextResponse.json(
      { error: "Format d'ID invalide. Doit être un nombre entier." },
      { status: 400 },
    );
  }

  return parseId;
}