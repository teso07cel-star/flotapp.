import Link from "next/link";
import { getVehiculoByPatente, getAllSucursales, createRegistroDiario } from "@/lib/actions";
import { redirect } from "next/navigation";

async function handleDriverForm(formData) {
  "use server";
  const vehiculoId = parseInt(formData.get("vehiculoId"));
  const nombreConductor = formData.get("nombreConductor");
  const kmActual = formData.get("kmActual");
  const novedades = formData.get("novedades");
  const sucursalIds = formData.getAll("sucursalIds").map(id => parseInt(id));

  const res = await createRegistroDiario({
    vehiculoId,
    nombreConductor,
    kmActual,
    novedades,
    sucursalIds
  });

  if (res.success) {
    redirect("/?success=true");
  }
}

export default async function DriverForm({ searchParams }) {
  const params = await searchParams;
  const patente = params.patente;

  if (!patente) {
    redirect("/driver/entry");
  }

  const [vehiculoRes, sucursalesRes] = await Promise.all([
    getVehiculoByPatente(patente),
    getAllSucursales()
  ]);

  if (!vehiculoRes.success || !vehiculoRes.data) {
    redirect("/driver/entry?error=Vehículo no encontrado");
  }

  const vehiculo = vehiculoRes.data;
  const sucursales = sucursalesRes.success ? sucursalesRes.data : [];
  const lastLog = vehiculo.registros?.[0];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <Link 
          href="/driver/entry"
          className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver
        </Link>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-800">
            <div className="h-14 w-20 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl flex items-center justify-center border border-gray-600 shadow-inner">
               <span className="font-mono font-bold text-white tracking-wider text-lg">{vehiculo.patente}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Bitácora Diaria</h1>
              <p className="text-sm text-gray-400">Completá los datos de tu jornada</p>
            </div>
          </div>

          <form action={handleDriverForm} className="space-y-8">
            <input type="hidden" name="vehiculoId" value={vehiculo.id} />
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Nombre del Conductor</label>
              <input
                name="nombreConductor"
                type="text"
                required
                defaultValue={lastLog?.nombreConductor || ""}
                className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-700 font-medium"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Kilometraje Actual</label>
              <div className="relative group">
                <input
                  name="kmActual"
                  type="number"
                  required
                  defaultValue={lastLog?.kmActual || ""}
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-700 font-bold text-xl"
                  placeholder="Ej. 145000"
                />
                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                  <span className="text-gray-600 font-bold uppercase tracking-widest text-xs">km</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Sucursales Visitadas</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {sucursales.map(s => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-gray-800 bg-gray-950/50 hover:border-gray-700 transition-all cursor-pointer group"
                  >
                    <input 
                      type="checkbox" 
                      name="sucursalIds" 
                      value={s.id}
                      className="w-5 h-5 rounded-md border-gray-700 bg-gray-950 text-blue-600 focus:ring-blue-500 transition-all"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{s.nombre}</div>
                      <div className="text-[10px] text-gray-500 truncate">{s.direccion}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Novedades o Fallas</label>
              <textarea
                name="novedades"
                rows={3}
                className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-700 font-medium"
                placeholder="¿Algún problema con el vehículo?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-xl shadow-blue-500/25 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex justify-center items-center gap-3 group"
            >
              ENVIAR BITÁCORA
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
