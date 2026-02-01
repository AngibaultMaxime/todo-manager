'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { accessToken, logout, user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier le rôle d'un utilisateur
  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!confirm(`Êtes-vous sûr de changer le rôle en ${newRole} ?`)) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la modification');
      }

      await fetchUsers(); // Rafraîchir la liste
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${userName}" ? Cette action est irréversible.`)) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      await fetchUsers(); // Rafraîchir la liste
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        {/* Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-700 font-medium">Chargement des utilisateurs...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-red-900 font-semibold">{error}</p>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
              {/* Compteur */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-600">
                  {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-purple-600 font-semibold">
                    👑 {users.filter(u => u.role === 'ADMIN').length} Admin{users.filter(u => u.role === 'ADMIN').length > 1 ? 's' : ''}
                  </span>
                  <span className="text-blue-600 font-semibold">
                    👤 {users.filter(u => u.role === 'USER').length} User{users.filter(u => u.role === 'USER').length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Rôle</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date d'inscription</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => {
                      const isCurrentUser = u.id === user?.id;

                      return (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-gray-500">#{u.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${u.role === 'ADMIN' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{u.name}</span>
                              {isCurrentUser && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-semibold">Vous</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                          <td className="px-6 py-4">
                            {isCurrentUser ? (
                              // Pas de select pour soi-même
                              <span className="px-3 py-1 text-xs font-bold rounded bg-purple-600 text-white">
                                👑 ADMIN
                              </span>
                            ) : (
                              // Select pour changer le rôle
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="px-3 py-1 text-xs font-bold rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                style={{
                                  backgroundColor: u.role === 'ADMIN' ? '#7c3aed' : '#2563eb',
                                  color: 'white',
                                }}
                              >
                                <option value="ADMIN" style={{ color: '#1f2937' }}>👑 ADMIN</option>
                                <option value="USER" style={{ color: '#1f2937' }}>👤 USER</option>
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(u.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {isCurrentUser ? (
                              <span className="text-xs text-gray-400 italic">Vous ne pouvez pas vous supprimer</span>
                            ) : (
                              <button
                                onClick={() => handleDelete(u.id, u.name)}
                                className="px-3 py-1 text-sm font-semibold text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                              >
                                🗑️ Supprimer
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}