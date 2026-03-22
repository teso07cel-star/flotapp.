import { defineConfig } from "prisma/config";

// FORZAMOS el uso de la base de datos de Vercel (la que conectamos al final)
// Ignoramos cualquier residuo de Supabase
const databaseUrl = 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_PRISMA_DATABASE_URL;

if (!databaseUrl) {
  console.log("AVISO: No se detecta la base de datos de Vercel. Asegurate de que este conectada en la pestaña 'Storage'.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
