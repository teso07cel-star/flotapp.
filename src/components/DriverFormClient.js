"use client";

import { useState } from "react";
import { createRegistroDiario } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function DriverFormClient({ vehiculo, sucursales, lastLog }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [authCode, setAuthCode] = useState("");
    const [selectedSucursales, setSelectedSucursales] = useState([]);

  const toggleSucursal = (id) => {
        setSelectedSucursales(prev => 
                                    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
                                  );
  };

  const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const kmActual = parseInt(formData.get("kmActual"));

        if (vehiculo.codigoAutorizacion && !authCode) {
                setShowAuth(true);
                setLoading(false);
                return;
        }

        const data = {
                vehiculoId: vehiculo.id,
                kmActual,
                novedades: formData.get("novedades"),
                nombreConductor: formData.get("nombreConductor"),
                sucursalIds: selectedSucursales,
                authCode
        };

        const res = await createRegistroDiario(data);
        if (res.success) {
                window.location.href = "/?success=true";
        } else {
                setError(res.error);
                setLoading(false);
        }
  };

  return (
        <form onSubmit={handleSubmit} className="space-y-8">
  {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  {error}
  </div>
        )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Kilometraje Actual</label>
          <div className="relative">
                    <input 
              name="kmActual" 
              type="number" 
              required 
              placeholder={lastLog ? `ltimo: ${lastLog.kmActual}` : "Ej. 125400"}
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xl font-mono font-bold"
            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 font-black text-xs">KM</div>
                </div>
                </div>

        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Tu Nombre</label>
          <input 
            name="nombreConductor" 
            type="text" 
            required 
            placeholder="Ej. Juan Prez"
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
          />
              </div>
              </div>

      <div className="space-y-4">
                      <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Sucursales Visitadas</label>
    
