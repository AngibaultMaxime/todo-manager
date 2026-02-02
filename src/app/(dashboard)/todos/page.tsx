"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Modal from "@/components/Modal";
import TodoForm from "@/components/TodoForm";
import Navbar from "@/components/Navbar";
import { useTodos } from "@/hooks/useTodos";
import TodoList from "@/components/TodoList";
import TodoFilters from "@/components/TodoFilters";

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

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

export default function TodosPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { accessToken, logout, user } = useAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // ✅ Définition des filtres et hook
  const filters = {
    search,
    status: statusFilter,
    priority: priorityFilter,
    categoryId: categoryFilter,
  };
  const {
    allTodos,
    myTodos,
    isLoading,
    error,
    refreshAllTodos,
    refreshMyTodos,
  } = useTodos(user, filters);

  const isAdmin = user?.role === "ADMIN";

  // Charger catégories et users au démarrage
  useEffect(() => {
    fetchCategories();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Erreur categories:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Erreur users:", err);
    }
  };

  const handleCreate = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la création");

      // ✅ rafraîchir les todos via le hook
      await refreshAllTodos();
      await refreshMyTodos();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (formData: any) => {
    if (!editingTodo) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/todos/${editingTodo.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la modification");

      // ✅ rafraîchir les todos via le hook
      await refreshAllTodos();
      await refreshMyTodos();
      setIsEditModalOpen(false);
      setEditingTodo(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce todo ?")) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression");

      // ✅ rafraîchir les todos via le hook
      await refreshAllTodos();
      await refreshMyTodos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditModalOpen(true);
  };

  return (
    <ProtectedRoute>
      {/* Header */}
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        {/* Barre de filtres */}
        <TodoFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          onReset={resetFilters}
        />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Affichage du loading / erreur */}
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
          ) : (
            <>
              {/* Card + pour créer un nouveau todo (uniquement pour admin) */}
              {isAdmin && (
                <div
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center justify-center cursor-pointer bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6 hover:bg-blue-50 hover:shadow-lg transition-all"
                >
                  <div className="text-4xl">➕</div>
                  <p className="ml-4 font-semibold text-gray-700">
                    Créer un nouveau todo
                  </p>
                </div>
              )}
              <TodoList
                todos={myTodos}
                isAdmin={isAdmin}
                onEdit={openEditModal}
                onDelete={handleDelete}
                title="👤 Mes tâches assignées"
              />
              <TodoList
                todos={allTodos}
                isAdmin={isAdmin}
                onEdit={openEditModal}
                onDelete={handleDelete}
                title="📝 Toutes les tâches"
              />
            </>
          )}
        </main>

        {/* Modal Création */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Créer un nouveau todo"
        >
          <TodoForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
            categories={categories}
            users={users}
          />
        </Modal>

        {/* Modal Édition */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTodo(null);
          }}
          title="Modifier le todo"
        >
          {editingTodo && (
            <TodoForm
              initialData={{
                title: editingTodo.title,
                description: editingTodo.description || "",
                status: editingTodo.status,
                priority: editingTodo.priority,
                dueDate: editingTodo.dueDate
                  ? editingTodo.dueDate.slice(0, 16)
                  : "",
                categoryId: editingTodo.categoryId,
                assignedToId: editingTodo.assignedToId,
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingTodo(null);
              }}
              isLoading={isSubmitting}
              categories={categories}
              users={users}
            />
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
