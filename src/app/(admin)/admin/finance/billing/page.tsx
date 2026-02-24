'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Calendar,
    Percent,
    CheckCircle2,
    AlertCircle,
    Clock,
    Activity,
    Search,
    ChevronRight,
    Power
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GymBilling {
    id: string;
    nombre: string;
    slug: string;
    estado_pago_saas: string;
    fecha_proximo_pago: string;
    descuento_saas: number;
    planes_suscripcion: { nombre: string };
}

export default function AdminBillingPage() {
    const [gyms, setGyms] = useState<GymBilling[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGym, setSelectedGym] = useState<GymBilling | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchGyms();
    }, []);

    const fetchGyms = async () => {
        try {
            const res = await fetch('/api/admin/billing');
            const data = await res.json();
            if (res.ok) setGyms(data.gyms || []);
        } catch (error) {
            toast.error('Error al cargar datos financieros');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (gymId: string, status: string) => {
        setUpdating(true);
        try {
            const res = await fetch('/api/admin/billing/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gymId, status })
            });
            if (res.ok) {
                toast.success('Estado actualizado');
                fetchGyms();
                setSelectedGym(null);
            }
        } catch (error) {
            toast.error('Error al actualizar');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateDiscount = async (gymId: string, discount: number) => {
        setUpdating(true);
        try {
            const res = await fetch('/api/admin/billing/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gymId, discount })
            });
            if (res.ok) {
                toast.success(`Descuento del ${discount}% aplicado`);
                fetchGyms();
            }
        } catch (error) {
            toast.error('Error al aplicar descuento');
        } finally {
            setUpdating(false);
        }
    };

    const filteredGyms = gyms.filter(g =>
        g.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-red-500 italic uppercase italic tracking-tighter">
                    💰 Consola de Facturación B2B
                </h1>
                <p className="text-gray-400 mt-2 font-medium">
                    Gestiona los ingresos de la plataforma y el estado de tus clientes.
                </p>
            </div>

            {/* Quick Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1c1c1e] p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Activos al Día</p>
                        <p className="text-2xl font-black text-white">{gyms.filter(g => g.estado_pago_saas === 'al_dia').length}</p>
                    </div>
                </div>
                <div className="bg-[#1c1c1e] p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pendientes de Pago</p>
                        <p className="text-2xl font-black text-white">{gyms.filter(g => g.estado_pago_saas === 'pendiente').length}</p>
                    </div>
                </div>
                <div className="bg-[#1c1c1e] p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                        <Power size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Suspendidos</p>
                        <p className="text-2xl font-black text-white">{gyms.filter(g => g.estado_pago_saas === 'suspendido').length}</p>
                    </div>
                </div>
            </div>

            {/* Main List */}
            <div className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
                    <h3 className="text-xl font-black text-white italic uppercase">Clientes de la Red</h3>
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar gimnasio o slug..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-red-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/20 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">Gimnasio</th>
                                <th className="px-8 py-5">Plan actual</th>
                                <th className="px-8 py-5">Estado Pago</th>
                                <th className="px-8 py-5">Próx. Vencimiento</th>
                                <th className="px-8 py-5">Descuento</th>
                                <th className="px-8 py-5 text-right">Mando Global</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="h-16 bg-white/2"></td>
                                    </tr>
                                ))
                            ) : filteredGyms.map((gym) => (
                                <tr key={gym.id} className="hover:bg-white/2 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white">{gym.nombre}</span>
                                            <span className="text-[10px] font-mono text-gray-500">{gym.slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                                            {gym.planes_suscripcion?.nombre || 'Personalizado'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${gym.estado_pago_saas === 'al_dia' ? 'bg-green-500' :
                                                    gym.estado_pago_saas === 'pendiente' ? 'bg-amber-500' : 'bg-red-500'
                                                } animate-pulse`} />
                                            <span className={`text-[11px] font-bold uppercase tracking-wider ${gym.estado_pago_saas === 'al_dia' ? 'text-green-500' :
                                                    gym.estado_pago_saas === 'pendiente' ? 'text-amber-500' : 'text-red-500'
                                                }`}>
                                                {gym.estado_pago_saas.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                            <Calendar size={14} className="text-red-500" />
                                            {new Date(gym.fecha_proximo_pago).toLocaleDateString('es-AR')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Percent size={14} className="text-blue-500" />
                                            <input
                                                type="number"
                                                className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                                                defaultValue={gym.descuento_saas}
                                                onBlur={(e) => handleUpdateDiscount(gym.id, parseInt(e.target.value))}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(gym.id, 'al_dia')}
                                                className="p-2 hover:bg-green-500/10 text-gray-600 hover:text-green-500 transition-colors rounded-xl"
                                                title="Marcar como Al Día"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(gym.id, 'suspendido')}
                                                className="p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-500 transition-colors rounded-xl"
                                                title="Suspender acceso"
                                            >
                                                <Power size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Commercial Strategies Tips */}
            <div className="p-8 bg-gradient-to-br from-red-600/10 to-transparent border border-red-500/20 rounded-[3rem]">
                <h3 className="text-lg font-black text-white italic uppercase mb-2 tracking-tight">Estrategia de Crecimiento SaaS</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                    Utiliza los descuentos para fidelizar a gimnasios fundadores o instituciones con múltiples sedes.
                    Si un gimnasio entra en estado <span className="text-red-400 font-bold">"Suspendido"</span>, sus administradores verán un bloqueo de pantalla exigiendo la regulación del pago para continuar operando.
                </p>
            </div>
        </div>
    );
}
