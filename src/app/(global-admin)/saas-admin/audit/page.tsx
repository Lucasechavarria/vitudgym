'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    UserCheck,
    History,
    Search,
    ChevronLeft,
    Clock,
    Database,
    Zap,
    ArrowUpRight,
    Eye,
    Download,
    Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SystemLog {
    id: string;
    usuario_id: string;
    tabla: string;
    operacion: string;
    registro_id: string;
    datos_anteriores: unknown;
    datos_nuevos: unknown;
    creado_en: string;
    perfiles?: { nombre_completo: string; email: string };
}

interface ImpersonationLog {
    id: string;
    admin_id: string;
    gimnasio_id: string;
    motivo: string;
    duracion_minutos: number;
    creado_en: string;
    admin_profile?: { nombre_completo: string; email: string };
    gimnasio?: { nombre: string };
}

export default function AuditLogsPage() {
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [impersonationLogs, setImpersonationLogs] = useState<ImpersonationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'system' | 'impersonation'>('system');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchLogs();
    }, [activeTab, startDate, endDate]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                type: activeTab,
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            });
            const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
            const data = await res.json();
            if (res.ok) {
                if (activeTab === 'system') setSystemLogs(data.systemLogs || []);
                else setImpersonationLogs(data.impersonationLogs || []);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const logs = activeTab === 'system' ? systemLogs : impersonationLogs;
        if (logs.length === 0) return;

        const headers = activeTab === 'system'
            ? ['ID', 'Fecha', 'Operación', 'Tabla', 'Usuario', 'Email']
            : ['ID', 'Fecha', 'Administrador', 'Gimnasio', 'Motivo', 'Duración (min)'];

        const rows = logs.map(log => {
            if (activeTab === 'system') {
                const sLog = log as SystemLog;
                return [sLog.id, sLog.creado_en, sLog.operacion, sLog.tabla, sLog.perfiles?.nombre_completo, sLog.perfiles?.email];
            } else {
                const iLog = log as ImpersonationLog;
                return [iLog.id, iLog.creado_en, iLog.admin_profile?.nombre_completo, iLog.gimnasio?.nombre, iLog.motivo, iLog.duracion_minutos];
            }
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_log_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4 group"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-600/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <History size={24} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                                Centro de <span className="text-amber-500">Auditoría</span>
                            </h1>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Control y Trazabilidad de Acciones Críticas</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <Download size={14} />
                        Exportar CSV
                    </button>
                    <div className="flex bg-[#1c1c1e] p-1.5 rounded-2xl border border-white/5">
                        {[
                            { id: 'system', label: 'Sistema', icon: <Database size={14} /> },
                            { id: 'impersonation', label: 'Accesos Remotos', icon: <ShieldAlert size={14} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'system' | 'impersonation')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por usuario, acción o ID..."
                        className="w-full bg-[#1c1c1e] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-amber-500/50 transition-all text-xs font-bold uppercase tracking-widest placeholder:text-gray-600"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <div className="relative flex items-center bg-[#1c1c1e] border border-white/5 rounded-2xl px-4 py-2">
                        <Calendar size={14} className="text-amber-500 mr-2" />
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-gray-500 uppercase">Desde</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="bg-transparent text-[10px] font-bold text-white uppercase focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="relative flex items-center bg-[#1c1c1e] border border-white/5 rounded-2xl px-4 py-2">
                        <Calendar size={14} className="text-amber-500 mr-2" />
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-gray-500 uppercase">Hasta</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="bg-transparent text-[10px] font-bold text-white uppercase focus:outline-none"
                            />
                        </div>
                    </div>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="px-4 text-[8px] font-black uppercase text-amber-500 hover:text-white transition-colors"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Content Table/List */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-64 gap-4"
                    >
                        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] animate-pulse">Sincronizando Historial...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {activeTab === 'system' ? (
                            systemLogs.length === 0 ? <EmptyState /> : (
                                systemLogs.map((log, i) => (
                                    <SystemLogCard key={log.id} log={log} index={i} />
                                ))
                            )
                        ) : (
                            impersonationLogs.length === 0 ? <EmptyState /> : (
                                impersonationLogs.map((log, i) => (
                                    <ImpersonationCard key={log.id} log={log} index={i} />
                                ))
                            )
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-32 bg-[#1c1c1e] border border-dashed border-white/5 rounded-[3rem]">
            <History size={48} className="text-gray-800 mb-6" />
            <h3 className="text-xl font-black text-gray-700 italic uppercase">No se encontraron registros</h3>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-2">La red está limpia por ahora</p>
        </div>
    );
}

function SystemLogCard({ log, index }: { log: SystemLog, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-[#1c1c1e] border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:border-amber-500/30 transition-all"
        >
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-black text-[10px] uppercase leading-none text-center p-2 ${log.operacion === 'INSERT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    log.operacion === 'DELETE' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                    <span>{log.operacion}</span>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black text-white italic uppercase tracking-tight">{log.tabla}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-700" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ID: {log.registro_id.substring(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                        <UserCheck size={12} className="text-amber-500" />
                        <span className="font-bold text-gray-300">{log.perfiles?.nombre_completo || 'Sistema Automático'}</span>
                        <span className="opacity-40">{log.perfiles?.email}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="text-right">
                    <p className="text-[10px] font-black text-white uppercase tracking-tighter mb-1">
                        {new Date(log.creado_en).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 text-gray-600">
                        <Clock size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Registro Guardado</span>
                    </div>
                </div>
                <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all group-hover:bg-amber-600 group-hover:text-white">
                    <Eye size={18} />
                </button>
            </div>
        </motion.div>
    );
}

function ImpersonationCard({ log, index }: { log: ImpersonationLog, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-[#1c1c1e] border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:border-red-500/30 transition-all relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600/40" />

            <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
                    <ShieldAlert size={28} />
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-sm font-black text-white italic uppercase tracking-tight">Acceso Remoto: {log.gimnasio?.nombre}</h4>
                        <span className="px-2 py-0.5 bg-red-600/20 text-red-500 text-[8px] font-black rounded uppercase">Auditado</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Motivo: <span className="text-gray-300 italic">{log.motivo}</span></p>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                        <Zap size={12} className="text-red-500" />
                        <span className="font-bold text-gray-300">ADMIN: {log.admin_profile?.nombre_completo}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-700 mx-1" />
                        <span className="font-mono text-[9px]">{log.duracion_minutos} min sesión</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="text-right">
                    <p className="text-[10px] font-black text-white uppercase tracking-tighter mb-1">
                        {new Date(log.creado_en).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 text-red-500/60">
                        <ArrowUpRight size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Impersonación Exitosa</span>
                    </div>
                </div>
                <button className="p-3 bg-red-600/10 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all">
                    <Eye size={18} />
                </button>
            </div>
        </motion.div>
    );
}
