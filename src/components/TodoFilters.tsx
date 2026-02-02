'use client';

interface Props {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  categories: { id: number; name: string }[];
  onReset: () => void;
}

export default function TodoFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  onReset,
}: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Recherche */}
          <div className="flex-1 min-w-64">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              🔍 Recherche
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher un todo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              📊 Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">EN COURS</option>
              <option value="DONE">TERMINÉ</option>
              <option value="ARCHIVED">ARCHIVÉ</option>
            </select>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              🔥 Priorité
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="HIGH">HAUTE</option>
              <option value="MEDIUM">MOYENNE</option>
              <option value="LOW">BASSE</option>
            </select>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              🏷️ Catégorie
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Réinitialiser */}
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            ↺ Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
