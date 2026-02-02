'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.role === 'ADMIN';

  // Links disponibles selon le rôle
  const navLinks = [
    ...(isAdmin ? [{ href: '/dashboard', label: '📊 Dashboard' }] : []),
    { href: '/todos', label: '📋 Todos' },
    ...(isAdmin ? [{ href: '/categories', label: '🏷️ Catégories' }] : []),
    ...(isAdmin ? [{ href: '/users', label: '👥 Utilisateurs' }] : []),
  ];

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">
            📝 Todo Manager
          </h1>
          <nav className="flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  pathname === link.href
                    ? 'bg-blue-600 text-white'  // Page active
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'  // Page inactive
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User info + Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs">
              <span className={`px-2 py-1 rounded font-bold ${isAdmin ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                {isAdmin ? '👑 ADMIN' : '👤 USER'}
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
  );
}