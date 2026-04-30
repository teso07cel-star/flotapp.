"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllVehiculos() {
    try {
          const v = await prisma.vehiculo.findMany({
                  include: { registros: { orderBy: { fecha: "desc" }, take: 1 } },
                  orderBy: { patente: "asc" }
          });
          return { success: true, data: v };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function getVehiculoById(id) {
    try {
          const v = await prisma.vehiculo.findUnique({
                  where: { id: parseInt(id) },
                  include: { registros: { orderBy: { fecha: "desc" }, include: { sucursales: true } } }
          });
          return { success: true, data: v };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function createVehiculo(data) {
    try {
          const v = await prisma.vehiculo.create({
                  data: {
                            patente: data.patente.toUpperCase().trim(),
                            vtvVencimiento: data.vtvVencimiento ? new Date(data.vtvVencimiento) : null,
                            seguroVencimiento: data.seguroVencimiento ? new Date(data.seguroVencimiento) : null,
                            proximoServiceKm: data.proximoServiceKm ? parseInt(data.proximoServiceKm) : null,
                            proximoCambioCubiertasKm: data.proximoCambioCubiertasKm ? parseInt(data.proximoCambioCubiertasKm) : null,
                  }
          });
          revalidatePath("/admin");
          return { success: true, data: v };
    } catch(error) {
          return { success: false, error: error.message };
    }
}

export async function updateVehiculo(id, data) {
    try {
          const updateData = { ...data };
          if (updateData.vtvVencimiento) updateData.vtvVencimiento = new Date(updateData.vtvVencimiento);
          if (updateData.seguroVencimiento) updateData.seguroVencimiento = new Date(updateData.seguroVencimiento);
          if (updateData.proximoServiceKm !== undefined) updateData.proximoServiceKm = parseInt(updateData.proximoServiceKm) || null;
          if (updateData.proximoCambioCubiertasKm !== undefined) updateData.proximoCambioCubiertasKm = parseInt(updateData.proximoCambioCubiertasKm) || null;

      const vehiculo = await prisma.vehiculo.update({
              where: { id: parseInt(id) },
              data: updateData
      });
          revalidatePath("/admin/vehicles/[id]", "page");
          revalidatePath("/admin");
          return { success: true, data: vehiculo };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function handleDriverEntry(formData) {
    const patente = formData.get("patente")?.toString().toUpperCase().trim();
    if (!patente) return { success: false, error: "Patente requerida" };
    const { redirect } = await import("next/navigation");
    redirect(`/driver/form?patente=${patente}`);
}

export async function getVehiculoByPatente(patente) {
    try {
          const v = await prisma.vehiculo.findUnique({
                  where: { patente: patente.toUpperCase().trim() },
                  include: { registros: { orderBy: { fecha: "desc" }, take: 1 } }
          });
          return { success: true, data: v };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function getAllSucursales() {
    try {
          const s = await prisma.sucursal.findMany({ orderBy: { nombre: "asc" } });
          return { success: true, data: s };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function createRegistroDiario(data) {
    try {
          const vehiculoId = parseInt(data.vehiculoId);
          const kmActual = parseInt(data.kmActual);

      const v = await prisma.vehiculo.findUnique({ where: { id: vehiculoId } });
          if (v.codigoAutorizacion && v.codigoAutorizacion !== data.authCode) {
                   return { success: false, error: "Cdigo de autorizacin invlido.
                            return { success: false, error: "Cdigo de autorizacin invlido." };
          }

      const registro = await prisma.registroDiario.create({
              data: {
                        vehiculoId,
                        kmActual,
                        novedades: data.novedades || null,
                        novedadResuelta: false,
                        nombreConductor: data.nombreConductor || null,
                        fecha: new Date(new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"})),
                        sucursales: {
                                    connect: data.sucursalIds ? data.sucursalIds.map(id => ({ id: parseInt(id) })) : []
                        }
              }
      });
          revalidatePath("/admin");
          return { success: true, data: registro };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function deleteVehiculo(id) {
    try {
          await prisma.vehiculo.delete({ where: { id: parseInt(id) } });
          revalidatePath("/admin");
          return { success: true };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function resolverNovedad(registroId, resolucion) {
    try {
          await prisma.registroDiario.update({
                  where: { id: parseInt(registroId) },
                  data: {
                            novedadResuelta: true,
                            resolucion: resolucion
                  }
          });
          revalidatePath("/admin");
          return { success: true };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function deleteRegistroDiario(id) {
    try {
          await prisma.registroDiario.delete({ where: { id: parseInt(id) } });
          revalidatePath("/admin");
          return { success: true };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function updateAuthCode(vehiculoId, code) {
    try {
          await prisma.vehiculo.update({
                  where: { id: parseInt(vehiculoId) },
                  data: { codigoAutorizacion: code || null }
          });
          revalidatePath(`/admin/vehicles/${vehiculoId}`);
          return { success: true };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function getUltimosRegistros(limit = 10) {
    try {
          const r = await prisma.registroDiario.findMany({
                  take: limit,
                  orderBy: { fecha: "desc" },
                  include: { vehiculo: true, sucursales: true }
          });
          return { success: true, data: r };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function getMonthlySummary(month, year) {
    try {
          const startDate = new Date(year, month, 1);
          const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const vehiculos = await prisma.vehiculo.findMany({
              include: {
                        registros: {
                                    where: { fecha: { gte: startDate, lte: endDate } },
                                    orderBy: { fecha: "asc" },
                                    include: { sucursales: true }
                        },
                        gastos: {
                                    where: { fecha: { gte: startDate, lte: endDate } }
                        }
              }
      });

      const summary = vehiculos.map(v => {
              const firstLog = v.registros[0];
              const lastLog = v.registros[v.registros.length - 1];
              const kmRecorridos = (firstLog && lastLog) ? (lastLog.kmActual - firstLog.kmActual) : 0;
              const totalGastos = v.gastos.reduce((sum, g) => sum + g.monto, 0);

                                          const visitasSucursales = v.registros.reduce((count, r) => count + (r.sucursales?.length || 0), 0);

                                          return {
                                                    id: v.id,
                                                    patente: v.patente,
                                                    kmRecorridos: kmRecorridos > 0 ? kmRecorridos : 0,
                                                    totalGastos,
                                                    visitasSucursales
                                          };
      });

      const totalFleetVisits = summary.reduce((sum, v) => sum + v.visitasSucursales, 0);

      return { success: true, data: { summary, totalFleetVisits } };
    } catch (error) {
          return { success: false, error: error.message };
    }
}

export async function getDailyReport(dateString) {
    try {
          if (!dateString) {
                    dateString = new Date().toLocaleString("en-CA", {timeZone: "America/Argentina/Buenos_Aires"}).split(',')[0];
          }

      const startDate = new Date(dateString + "T00:00:00");
          const endDate = new Date(dateString + "T23:59:59");

      const registros = await prisma.registroDiario.findMany({
              where: { fecha: { gte: startDate, lte: endDate } },
              include: { vehiculo: true, sucursales: true },
              orderBy: { fecha: "desc" }
      });

      const stats = {
              totalVisits: registros.reduce((sum, r) => sum + (r.sucursales?.length || 0), 0),
              uniqueVehicles: new Set(registros.map(r => r.vehiculoId)).size,
              totalKm: 0,
              branchBreakdown: {}
      };

      registros.forEach(r => {
              r.sucursales.forEach(s => {
                        stats.branchBreakdown[s.nombre] = (stats.branchBreakdown[s.nombre] || 0) + 1;
              });
      });

      return { success: true, data: { registros, stats } };
    } catch (error) {
          return { success: false, error: error.message };
    }
}
