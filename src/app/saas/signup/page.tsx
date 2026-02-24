'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    User,
    CreditCard,
    CheckCircle2,
    ArrowRight,
    Zap,
    ShieldCheck,
    Globe,
    Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SaaSOnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        gymName: '',
        gymSlug: '',
        planId: ''
    });

    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/plans/list')
            .then(res => res.json())
            .then(data => {
                setPlans(data.plans || []);
                if (data.plans?.length > 0) {
                    setFormData(prev => ({ ...prev, planId: data.plans[0].id }));
                }
            });
    }, []);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/saas/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('¡Gimnasio creado con éxito!');
                router.push('/login?message=Account created. Please log in.');
            } else {
                toast.error(data.error || 'Error al completar registro');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-600">
            {/* Header */}
            <header className="p-8 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black italic">V</div>
                    <span className="text-xl font-black italic uppercase tracking-tighter">Virtud<span className="text-red-600 font-bold">SaaS</span></span>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Paso {step} de 3
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter">Comienza tu <span className="text-red-600">Imperio</span></h1>
                                <p className="text-gray-400 text-lg">Primero, crea tu cuenta personal de administrador.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Nombre" value={formData.firstName} onChange={v => setFormData({ ...formData, firstName: v })} placeholder="Ej: Juan" />
                                <Input label="Apellido" value={formData.lastName} onChange={v => setFormData({ ...formData, lastName: v })} placeholder="Ej: Pérez" />
                            </div>
                            <Input label="Email Corporativo" type="email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} placeholder="admin@tugimnasio.com" />
                            <Input label="Contraseña" type="password" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} placeholder="Mínimo 8 caracteres" />

                            <button
                                onClick={nextStep}
                                disabled={!formData.email || !formData.password || !formData.firstName}
                                className="w-full py-6 bg-red-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                Siguiente paso <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter">Identidad del <span className="text-red-600">Centro</span></h1>
                                <p className="text-gray-400 text-lg">Configura los datos base de tu gimnasio o box.</p>
                            </div>

                            <Input label="Nombre del Gimnasio" value={formData.gymName} onChange={v => setFormData({ ...formData, gymName: v, gymSlug: v.toLowerCase().replace(/\s+/g, '-') })} placeholder="Ej: Titan Fitness Club" />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">URL Personalizada</label>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                                    <span className="text-gray-500 font-bold">virtud.gym/</span>
                                    <input
                                        type="text"
                                        className="bg-transparent text-white focus:outline-none flex-1 font-bold"
                                        value={formData.gymSlug}
                                        onChange={e => setFormData({ ...formData, gymSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 italic mt-1 ml-2">Esta será la dirección pública de tu gimnasio.</p>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={prevStep} className="flex-1 py-6 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                                    Atrás
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.gymName || !formData.gymSlug}
                                    className="flex-[2] py-6 bg-red-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    Elegir Plan <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter">Suscripción <span className="text-red-600">Digital</span></h1>
                                <p className="text-gray-400 text-lg">Comienza con 15 días gratis. Sin tarjeta de crédito requerida ahora.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {plans.map((p) => (
                                    <PlanCard
                                        key={p.id}
                                        plan={p}
                                        selected={formData.planId === p.id}
                                        onSelect={() => setFormData({ ...formData, planId: p.id })}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-4 pt-8">
                                <button onClick={prevStep} className="flex-1 py-6 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                                    Atrás
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.planId}
                                    className="flex-[2] py-6 bg-red-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loading ? 'Inicializando...' : 'Comenzar Mi Trial de 15 Días'} <Zap size={18} fill="white" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function Input({ label, type = "text", value, onChange, placeholder }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{label}</label>
            <input
                type={type}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-red-500 outline-none transition-all"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

function PlanCard({ plan, selected, onSelect }: any) {
    return (
        <button
            onClick={onSelect}
            className={`p-8 rounded-[2.5rem] border text-left transition-all ${selected ? 'bg-red-600 border-red-500 shadow-2xl scale-105' : 'bg-[#1c1c1e] border-white/5 hover:border-white/20'}`}
        >
            <div className={`mb-4 ${selected ? 'text-white' : 'text-red-500'}`}>
                {plan.nombre === 'Elite' ? <ShieldCheck size={32} /> : <Zap size={32} />}
            </div>
            <h3 className="text-xl font-black italic uppercase italic tracking-tight mb-1">{plan.nombre}</h3>
            <p className={`text-4xl font-black italic tracking-tighter mb-4 ${selected ? 'text-white' : 'text-gray-200'}`}>
                ${plan.precio_mensual}
            </p>
            <ul className="space-y-3">
                <li className={`text-[10px] font-bold uppercase ${selected ? 'text-red-100' : 'text-gray-500'}`}>
                    {plan.limite_usuarios} Alumnos
                </li>
                <li className={`text-[10px] font-bold uppercase ${selected ? 'text-red-100' : 'text-gray-500'}`}>
                    {plan.limite_sucursales} {plan.limite_sucursales === 1 ? 'Sede' : 'Sedes'}
                </li>
            </ul>
        </button>
    );
}
