'use client';

import { useState } from 'react';

interface CategoryFormProps {
  initialData?: {
    name: string;
    color: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const PRESET_COLORS = [
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Jaune', value: '#EAB308' },
  { name: 'Vert', value: '#22C55E' },
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#A855F7' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Gris', value: '#6B7280' },
];

export default function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    color: initialData?.color || '#3B82F6',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nom */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nom de la catégorie *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Travail, Personnel, Urgent..."
          disabled={isLoading}
          maxLength={50}
        />
      </div>

      {/* Couleur */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Couleur *
        </label>
        
        {/* Palette de couleurs */}
        <div className="grid grid-cols-5 gap-3 mb-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData({ ...formData, color: color.value })}
              className={`h-12 rounded-lg transition-all ${
                formData.color === color.value
                  ? 'ring-4 ring-blue-500 ring-offset-2 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              disabled={isLoading}
              title={color.name}
            />
          ))}
        </div>

        {/* Input couleur custom */}
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="h-12 w-20 rounded cursor-pointer"
            disabled={isLoading}
          />
          <span className="text-sm text-gray-600">
            Ou choisissez une couleur personnalisée
          </span>
        </div>

        {/* Aperçu */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: formData.color }}
          />
          <span className="font-semibold text-gray-800">
            {formData.name || 'Aperçu de la catégorie'}
          </span>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          disabled={isLoading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}