'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface DashboardStats {
  totals: {
    todos: number;
    users: number;
    categories: number;
  };
  todosByStatus: Record<string, number>;
  todosByPriority: Record<string, number>;
  todosByCategory: Array<{ name: string; count: number }>;
  recentTodos: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { accessToken, logout, user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-500 text-white';
      case 'IN_PROGRESS': return 'bg-blue-500 text-white';
      case 'DONE': return 'bg-green-500 text-white';
      case 'ARCHIVED': return 'bg-gray-700 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-800">
                📊 Dashboard Admin
              </h1>
              <Link 
                href="/todos"
                className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                Voir les todos
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs">
                  <span className="px-2 py-1 rounded bg-purple-600 text-white font-bold">
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
              <p className="mt-4 text-gray-700 font-medium">Chargement des statistiques...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-red-900 font-semibold">{error}</p>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Cards des totaux */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Todos</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totals.todos}</p>
                    </div>
                    <div className="text-4xl">📝</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totals.users}</p>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Catégories</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totals.categories}</p>
                    </div>
                    <div className="text-4xl">🏷️</div>
                  </div>
                </div>
              </div>

              {/* Todos par statut */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Todos par statut</h2>
                <div className="space-y-3">
                  {Object.entries(stats.todosByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded ${getStatusColor(status)}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-64 bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${getStatusColor(status)}`}
                            style={{ width: `${(count / stats.totals.todos) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-900 w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Todos par priorité */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🔥 Todos par priorité</h2>
                <div className="space-y-3">
                  {Object.entries(stats.todosByPriority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded ${getPriorityColor(priority)}`}>
                          {priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-64 bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${getPriorityColor(priority)}`}
                            style={{ width: `${(count / stats.totals.todos) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-900 w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Todos récents */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🕐 Todos récents</h2>
                <div className="space-y-2">
                  {stats.recentTodos.map((todo) => (
                    <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 font-mono text-sm">#{todo.id}</span>
                        <span className="font-semibold text-gray-900">{todo.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(todo.status)}`}>
                          {todo.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-bold rounded ${getPriorityColor(todo.priority)}`}>
                          {todo.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </ProtectedRoute>
  );
}