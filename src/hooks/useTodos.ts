import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export function useTodos(user: any, filters: any) {
  const { accessToken, logout } = useAuth();
  const [allTodos, setAllTodos] = useState([]);
  const [myTodos, setMyTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTodos = async (paramsObj: any) => {
    try {
      const params = new URLSearchParams(paramsObj);
      const res = await fetch(`/api/todos?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 401) return logout();

      if (!res.ok) throw new Error("Erreur lors de la récupération des todos");

      return (await res.json()).todos;
    } catch (error: any) {
      setError(error.message);
      return [];
    }
  };

  const refreshAllTodos = () =>
    fetchTodos({
      ...filters,
      excludeAssignedToId: user?.id,
    }).then(setAllTodos);

  const refreshMyTodos = () =>
    fetchTodos({
      ...filters,
      assignedToId: user?.id,
    }).then(setMyTodos);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    Promise.all([refreshAllTodos(), refreshMyTodos()]).finally(() =>
      setIsLoading(false),
    );
  }, [user, JSON.stringify(filters)]);

  return {
    allTodos,
    myTodos,
    isLoading,
    error,
    refreshAllTodos,
    refreshMyTodos,
  };
}
