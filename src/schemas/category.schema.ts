import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom est trop long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Code couleur invalide (format: #RRGGBB)').optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Code couleur invalide (format: #RRGGBB)').optional().nullable(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>