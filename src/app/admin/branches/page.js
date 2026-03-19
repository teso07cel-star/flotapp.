import { getAllSucursales, addSucursal, deleteSucursal } from "@/lib/actions";
import { revalidatePath } from "next/cache";

async function addSucursalAction(formData) {
  "use server";
  const nombre = formData.get("nombre")?.toString();
  const direccion = formData.get("direccion")?.toString();
  if (nombre) {
    await addSucursal(nombre, direccion);
    revalidatePath("/admin/branches");
  }
}

async function deleteSucursalAction(formData) {
  "use server";
  const id = formData.get("id");
  await deleteSucursal(id);
  const { redirect } = await import("next/navigation");
  redirect("/admin/branches");
}

export default async function BranchesManager() {
  const res = await getAllSucursales();
  const sucursales = res.success ? res.data : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Gestión de Sucursales</h1>
          <p className="text-gray-500 dark:text-gray-400">Administra los destinos visitables por tu flota.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-2xl shadow-black/5 sticky top-8">
              <h3 className="text-lg font-bold mb-6 uppercase tracking-wider">Nueva Sucursal</h3>
              <form action={addSucursalAction} className="space-y-5">
                 <div>
                   <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Nombre</label>
                   <input 
                    name="nombre" 
                    type="text" 
                    required 
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium" 
                    placeholder="Ej. Base CABA" 
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-widest">Dirección (Opcional)</label>
                   <input 
                    name="direccion" 
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium" 
                    placeholder="Av. Siempre Viva 123" 
                   />
                 </div>
                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 mt-4">
                   Agregar Sucursal
                 </button>
              </form>
            </div>
         </div>

         <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="p-5 pl-8 w-20">ID</th>
                    <th className="p-5">Nombre</th>
                    <th className="p-5">Dirección</th>
                    <th className="p-5 text-right pr-8">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {sucursales.length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-gray-500 font-medium">No hay sucursales registradas.</td></tr>
                  ) : sucursales.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                      <td className="p-5 pl-8 text-gray-500 text-xs font-bold">#{s.id}</td>
                      <td className="p-5 font-bold tracking-tight">{s.nombre}</td>
                      <td className="p-5 text-gray-500 text-xs font-medium">{s.direccion || "-"}</td>
                      <td className="p-5 pr-8 text-right">
                         <form action={deleteSucursalAction}>
                           <input type="hidden" name="id" value={s.id} />
                           <button 
                             type="submit"
                             className="inline-flex items-center justify-center h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/30"
                             title="Eliminar"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                           </button>
                         </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
      </div>
    </div>
  );
}
