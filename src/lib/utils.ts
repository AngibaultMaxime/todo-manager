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

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-500 text-white";
    case "MEDIUM":
      return "bg-yellow-500 text-black";
    case "LOW":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "TODO":
      return "bg-gray-500 text-white";
    case "IN_PROGRESS":
      return "bg-blue-500 text-white";
    case "DONE":
      return "bg-green-500 text-white";
    case "ARCHIVED":
      return "bg-gray-700 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};
