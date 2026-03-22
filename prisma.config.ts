import { defineConfig } from "prisma/config";

// Buscamos todas las variantes posibles que Vercel suele inyectar
const databaseUrl = 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_DATABASE_URL ||
  process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
