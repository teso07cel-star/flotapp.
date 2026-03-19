require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const sucursales = [
    { nombre: 'Centro', direccion: 'Av. Principal 123' },
    { nombre: 'Norte', direccion: 'Ruta 9 Km 50' },
    { nombre: 'Sur', direccion: 'Av. San Martín 456' }
  ]

  for (const s of sucursales) {
    await prisma.sucursal.create({
      data: s,
    });
  }

  // Agregar vehículo de prueba
  await prisma.vehiculo.upsert({
    where: { patente: 'AB123CD' },
    update: {},
    create: {
      patente: 'AB123CD',
      vtvVencimiento: new Date('2026-12-31'),
      seguroVencimiento: new Date('2026-11-30'),
      proximoServiceKm: 50000,
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
