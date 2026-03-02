'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign,
    TrendingUp,
    Building2,
    Calendar,
    Download,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronLeft,
    Wallet
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Payment {
    id: string;
    monto: number;
    moneda: string;
    concepto: string;
    estado: string;
    creado_en: string;
    metodo_pago: string;
    usuario?: { nombre_completo: string; correo: string };
    gimnasio?: { nombre: string };
}

interface SaaSPayment {
    id: string;
    monto: number;
    moneda: string;
    estado: string;
    fecha_pago: string;
    referencia_externa: string;
    gimnasio?: { nombre: string };
}

export default function FinanceHubPage() {
    const [memberPayments, setMemberPayments] = useState<Payment[]>([]);
    const [saasPayments, setSaaSPayments] = useState<SaaSPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<'members' | 'saas'>('members');
    const [gyms, setGyms] = useState<{ id: string; nombre: string }[]>([]);
    const [selectedGym, setSelectedGym] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchFinanceData();
        fetchGyms();
    }, [selectedGym, startDate, endDate]);

    const fetchGyms = async () => {
        const res = await fetch('/api/admin/gyms');
        const data = await res.json();
        if (res.ok) setGyms(data.gyms || []);
    };

    const fetchFinanceData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ...(selectedGym !== 'all' && { gymId: selectedGym }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            });
            const res = await fetch(`/api/admin/finance?${params.toString()}`);
            const data = await res.json();
            if (res.ok) {
                setMemberPayments(data.memberPayments || []);
                setSaaSPayments(data.saasPayments || []);
            }
        } catch (error) {
            console.error('Error fetching finance:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = memberPayments
        .filter(p => p.estado === 'approved')
        .reduce((acc, p) => acc + Number(p.monto), 0);

    const saasRevenue = saasPayments
        .filter(p => p.estado === 'approved')
        .reduce((acc, p) => acc + Number(p.monto), 0);

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
                        <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                                MercadoPago <span className="text-emerald-500">Hub</span>
                            </h1>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Control Financiero de toda la Red</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-[#1c1c1e] p-1.5 rounded-2xl border border-white/5">
                    {[
                        { id: 'members', label: 'Pagos Alumnos', icon: <CreditCard size={14} /> },
                        { id: 'saas', label: 'Ingresos SaaS', icon: <TrendingUp size={14} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveView(tab.id as 'members' | 'saas')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === tab.id
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Recaudación Red"
                    value={`$${totalRevenue.toLocaleString()}`}
                    desc="Membresías cobradas por gimnasios"
                    icon={<DollarSign className="text-emerald-500" />}
                    color="text-emerald-500"
                />
                <StatCard
                    title="Ingresos SaaS"
                    value={`$${saasRevenue.toLocaleString()}`}
                    desc="Cobros por planes de suscripción"
                    icon={<TrendingUp className="text-blue-500" />}
                    color="text-blue-500"
                />
                <StatCard
                    title="Total Transacciones"
                    value={(memberPayments.length + saasPayments.length).toString()}
                    desc="Operaciones procesadas"
                    icon={<CreditCard className="text-purple-500" />}
                    color="text-purple-500"
                />
            </div>

            {/* Filters */}
            <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Filtrar por Gimnasio</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <select
                                value={selectedGym}
                                onChange={e => setSelectedGym(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-all text-xs font-bold uppercase tracking-widest"
                            >
                                <option value="all">Sincronizar Toda la Red</option>
                                {gyms.map(g => (
                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <DateFilter label="Desde" value={startDate} onChange={setStartDate} />
                        <DateFilter label="Hasta" value={endDate} onChange={setEndDate} />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Mostrando últimos {activeView === 'members' ? memberPayments.length : saasPayments.length} registros</p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase text-gray-400 transition-all">
                        <Download size={14} /> Descargar Reporte
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Consultando Ledger Central...</p>
                        </motion.div>
                    ) : (
                        <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            {activeView === 'members' ? (
                                memberPayments.length === 0 ? <EmptyFinance /> : (
                                    memberPayments.map((p, i) => <MemberPaymentRow key={p.id} payment={p} index={i} />)
                                )
                            ) : (
                                saasPayments.length === 0 ? <EmptyFinance /> : (
                                    saasPayments.map((p, i) => <SaaSPaymentRow key={p.id} payment={p} index={i} />)
                                )
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StatCard({ title, value, desc, icon, color }: { title: string, value: string, desc: string, icon: any, color: string }) {
    return (
        <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8 group hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{title}</h3>
            <p className={`text-4xl font-black italic uppercase italic leading-tight ${color}`}>{value}</p>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tight mt-2">{desc}</p>
        </div>
    );
}

function DateFilter({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
                <Calendar size={14} className="text-gray-500 mr-2" />
                <input
                    type="date"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="bg-transparent text-[10px] font-bold text-white uppercase focus:outline-none"
                />
            </div>
        </div>
    );
}

function MemberPaymentRow({ payment, index }: { payment: Payment, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group bg-[#1c1c1e] border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:border-emerald-500/30 transition-all"
        >
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${payment.estado === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    payment.estado === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                    {payment.estado === 'approved' ? <CheckCircle2 size={24} /> : payment.estado === 'pending' ? <Clock size={24} /> : <XCircle size={24} />}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black text-white italic uppercase tracking-tight">{payment.usuario?.nombre_completo}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-700" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{payment.metodo_pago}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                        <Building2 size={12} className="opacity-50" />
                        <span>{payment.gimnasio?.nombre || 'Red Global'}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-700 mx-1" />
                        <span>{payment.concepto}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className="text-lg font-black text-white italic tracking-tighter mb-1">${Number(payment.monto).toLocaleString()}</p>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{new Date(payment.creado_en).toLocaleString('es-AR')}</p>
            </div>
        </motion.div>
    );
}

function SaaSPaymentRow({ payment, index }: { payment: SaaSPayment, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group bg-[#1c1c1e] border border-white/5 rounded-3xl p-6 flex items-center justify-between hover:border-blue-500/30 transition-all"
        >
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black text-white italic uppercase tracking-tight">Cobro Suscripción SaaS</span>
                        <div className="w-1 h-1 rounded-full bg-gray-700" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">SaaS Revenue</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                        <Building2 size={12} className="opacity-50" />
                        <span className="text-gray-300 font-black">{payment.gimnasio?.nombre}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-700 mx-1" />
                        <span className="font-mono text-[9px]">Ref: {payment.referencia_externa}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className="text-lg font-black text-white italic tracking-tighter mb-1">${Number(payment.monto).toLocaleString()}</p>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{new Date(payment.fecha_pago).toLocaleString('es-AR')}</p>
            </div>
        </motion.div>
    );
}

function EmptyFinance() {
    return (
        <div className="py-20 flex flex-col items-center justify-center opacity-30">
            <CreditCard size={40} className="text-white mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Sin movimientos financieros</p>
        </div>
    );
}
