"use client";

import { getPriorityColor, getStatusColor } from "@/lib/utils";

interface Todo {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  category: { id: number; name: string; color: string | null } | null;
  assignedTo: { id: number; name: string; email: string } | null;
  categoryId: number | null;
  assignedToId: number | null;
}

interface Props {
  todos: Todo[];
  isAdmin: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  title: string;
}

export default function TodoList({
  todos,
  isAdmin,
  onEdit,
  onDelete,
  title,
}: Props) {
  if (!todos.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        {title}{" "}
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          {todos.length}
        </span>
      </h2>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="px-6 py-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {todo.title}
                    </h3>
                    <span className="text-gray-400 font-bold">•</span>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded ${getStatusColor(todo.status)}`}
                    >
                      {todo.status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded ${getPriorityColor(todo.priority)}`}
                    >
                      {todo.priority}
                    </span>
                  </div>

                  {todo.description && (
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                      {todo.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    {todo.category && (
                      <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                        {todo.category.color && (
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: todo.category.color }}
                          />
                        )}
                        <span className="font-medium text-gray-800">
                          {todo.category.name}
                        </span>
                      </span>
                    )}

                    {todo.assignedTo && (
                      <span className="bg-blue-50 px-3 py-1 rounded-full text-blue-800 font-medium">
                        👤 {todo.assignedTo.name}
                      </span>
                    )}

                    {todo.dueDate && (
                      <span className="bg-amber-50 px-3 py-1 rounded-full text-amber-800 font-medium">
                        📅 {new Date(todo.dueDate).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEdit(todo)}
                      className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => onDelete(todo.id)}
                      className="px-3 py-1 text-sm font-semibold text-red-600 bg-red-50 rounded hover:bg-red-100"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
