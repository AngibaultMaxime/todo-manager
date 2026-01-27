'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Pas connecté → login
      if (!user) {
        router.push('/login');
        return;
      }

      // Connecté mais pas admin alors que la page requiert admin
      if (requireAdmin && user.role !== 'ADMIN') {
        router.push('/todos'); // Redirige vers sa page
      }
    }
  }, [user, isLoading, requireAdmin, router]);

  // Pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Pas connecté
  if (!user) {
    return null;
  }

  // Connecté mais pas les bonnes permissions
  if (requireAdmin && user.role !== 'ADMIN') {
    return null;
  }

  // Tout est OK
  return <>{children}</>;
}