import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Assure-toi que Prisma prend l'URL de Vercel
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // obligatoire en production
      },
    },
  })

// Reuse Prisma client in dev to avoid hot reload issues
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
