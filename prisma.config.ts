import { defineConfig } from "prisma/config";

// FORZAMOS el uso de la variable de Vercel y BLOQUEAMOS a Supabase.
// Si esta variable no esta, el error nos dira "POSTGRES_URL is required"
// lo que significa que la base de datos no esta bien conectada en Vercel.
const databaseUrl = process.env.POSTGRES_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
