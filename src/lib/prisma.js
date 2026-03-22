import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

const globalForPrisma = globalThis

/**
 * Proxy para inicialización perezosa (Lazy) de Prisma.
 * Esto evita que el build de Next.js falle al evaluar el módulo 
 * si la base de datos no está disponible en ese preciso instante.
 */
const prisma = new Proxy({}, {
  get(target, prop) {
    // Si se intenta tratar al proxy como una promesa, devolvemos undefined
    if (prop === 'then') return undefined;

    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = prismaClientSingleton();
    }
    return globalForPrisma.prisma[prop];
  }
});

export default prisma
