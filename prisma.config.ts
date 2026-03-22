import { defineConfig } from "prisma/config";

// Para Prisma Postgres (el servicio de Prisma), la variable suele ser DATABASE_URL
// o la que Vercel inyecte a través de la integración oficial.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  },
});
