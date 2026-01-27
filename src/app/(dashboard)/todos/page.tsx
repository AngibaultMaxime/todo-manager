"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Todo {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  category: { id: number; name: string; color: string | null } | null;
  assignedTo: { id: number; name: string; email: string } | null;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { accessToken, logout, user } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des todos");
      }

      const data = await response.json();
      setTodos(data.todos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getStatusColor = (status: string) => {
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Header avec meilleur contraste */}
        <header className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">📋 Mes Todos</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-600">
                  <span
                    className={`px-2 py-0.5 rounded ${user?.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
                  >
                    {user?.role}
                  </span>
                </p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors shadow-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-700 font-medium">
                Chargement des todos...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-red-900 font-semibold">{error}</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 text-lg font-medium">
                📝 Aucun todo pour le moment
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Les todos créés apparaîtront ici
              </p>
            </div>
          ) : (
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
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(todo.status)}`}
                          >
                            {todo.status.replace("_", " ")}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${getPriorityColor(todo.priority)}`}
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
                                  style={{
                                    backgroundColor: todo.category.color,
                                  }}
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
                              📅{" "}
                              {new Date(todo.dueDate).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
