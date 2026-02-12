'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Line, Bar } from 'recharts';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface Payment {
    id: string;
    amount: number;
    status: string;
    concept: string;
    created_at: string;
    user_name?: string;
    metadata?: {
        category?: string;
        expense_date?: string;
    };
}

export default function FinancePage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        concepto: '',
        monto: '',
        fecha: '',
        categoria: 'Variable'
    });

    React.useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await fetch('/api/admin/payments');
            const data = await res.json();
            if (data.payments) {
                setPayments(data.payments);
            }
        } catch (_error) {
            toast.error('Error al cargar finanzas');
        } finally {
            setLoading(false);
        }
    };

    // Procesar datos para estadísticas
    const totalIncome = payments
        .filter(p => p.amount > 0 && p.status === 'approved')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalExpenses = Math.abs(payments
        .filter(p => p.amount < 0)
        .reduce((sum, p) => sum + Number(p.amount), 0));

    const netBalance = totalIncome - totalExpenses;

    // Procesar datos para gráfico de barras (Categorías)
    const categoryTotals = payments
        .filter(p => p.amount < 0)
        .reduce((acc: Record<string, number>, p: any) => {
            const cat = p.metadata?.category || 'Otros';
            acc[cat] = (acc[cat] || 0) + Math.abs(Number(p.amount));
            return acc;
        }, {});

    const barChartData = Object.entries(categoryTotals).map(([cat, val]) => ({
        categoria: cat,
        valor: val
    }));

    // Procesar datos para gráfico de líneas (Mensual)
    const monthlyData = (payments as any[]).reduce((acc: Record<string, any>, p: any) => {
        const date = new Date(p.created_at);
        const monthKey = date.toLocaleString('es-AR', { month: 'short' });
        if (!acc[monthKey]) acc[monthKey] = { month: monthKey, ingresos: 0, gastos: 0 };

        if (p.amount > 0 && p.status === 'approved') {
            acc[monthKey].ingresos += Number(p.amount);
        } else if (p.amount < 0) {
            acc[monthKey].gastos += Math.abs(Number(p.amount));
        }
        return acc;
    }, {});

    const lineChartData = Object.values(monthlyData);

    const handleAddExpense = async () => {
        if (!newExpense.concepto || !newExpense.monto || !newExpense.fecha) {
            toast.error('Completa todos los campos');
            return;
        }

        const toastId = toast.loading('Registrando gasto...');
        try {
            const res = await fetch('/api/admin/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concept: newExpense.concepto,
                    amount: -Math.abs(parseFloat(newExpense.monto)),
                    status: 'approved',
                    payment_method: 'manual',
                    payment_provider: 'internal',
                    notes: `Gasto - Categoría: ${newExpense.categoria}`,
                    metadata: { category: newExpense.categoria, expense_date: newExpense.fecha }
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Error al guardar');

            toast.success('Gasto registrado exitosamente', { id: toastId });
            setShowExpenseModal(false);
            setNewExpense({ concepto: '', monto: '', fecha: '', categoria: 'Variable' });
            fetchPayments();
        } catch (_error) {
            const err = _error as Error;
            console.error('Add expense error:', err);
            toast.error(err.message || 'Error al registrar gasto', { id: toastId });
        }
    };

    if (loading) {
        return <div className="p-20 text-center text-white">Cargando datos financieros...</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400 mb-2">
                        💰 Finanzas & Reportes
                    </h1>
                    <p className="text-gray-400">Panel de control financiero completo.</p>
                </div>

                <button
                    onClick={() => setShowExpenseModal(true)}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20"
                >
                    + Registrar Gasto
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Ingresos Totales', value: `$${totalIncome.toLocaleString()}`, trend: '', color: 'text-green-500', icon: '📈' },
                    { label: 'Gastos Totales', value: `$${totalExpenses.toLocaleString()}`, trend: '', color: 'text-red-500', icon: '📉' },
                    { label: 'Balance Neto', value: `$${netBalance.toLocaleString()}`, trend: '', color: 'text-blue-500', icon: '💵' },
                    { label: 'Tasa de Retención', value: '94%', trend: '', color: 'text-purple-500', icon: '🎯' }, // Keep mock for now or calculate if possible
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{stat.icon}</span>
                            <span className={`text-sm font-bold ${stat.color}`}>{stat.trend}</span>
                        </div>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                        <p className="text-3xl font-black text-white mt-2">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue vs Expenses Chart */}
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">📊 Ingresos vs Gastos</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={lineChartData.length > 0 ? lineChartData : [{ month: '---', ingresos: 0, gastos: 0 }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" />
                            <XAxis dataKey="month" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ background: '#1c1c1e', border: '1px solid #3a3a3c', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} name="Ingresos" />
                            <Line type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={3} name="Gastos" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">🎯 Gastos por Categoría</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barChartData.length > 0 ? barChartData : [{ categoria: '---', valor: 0 }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" />
                            <XAxis dataKey="categoria" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ background: '#1c1c1e', border: '1px solid #3a3a3c', borderRadius: '8px' }}
                            />
                            <Bar dataKey="valor" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">💳 Transacciones Recientes</h3>
                <div className="space-y-3">
                    {payments.slice(0, 5).map((tx, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                            <div>
                                <p className="font-bold text-white">{tx.user_name || tx.concept}</p>
                                <p className="text-xs text-gray-400">{tx.concept} • {new Date(tx.created_at).toLocaleDateString()}</p>
                            </div>
                            <p className={`text-lg font-bold ${Number(tx.amount) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {Number(tx.amount) > 0 ? '+' : ''}${Math.abs(Number(tx.amount)).toLocaleString()}
                            </p>
                        </div>
                    ))}
                    {payments.length === 0 && <p className="text-center text-gray-500 py-4">No hay transacciones registradas.</p>}
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">📊 Registro de Gastos</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0a0a0a] text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="p-3">Concepto</th>
                                <th className="p-3">Categoría</th>
                                <th className="p-3">Fecha</th>
                                <th className="p-3 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {payments.filter(p => Number(p.amount) < 0).map(expense => (
                                <tr key={expense.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 text-white font-medium">{expense.concept}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-bold">
                                            {expense.metadata?.category || 'General'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-400">{new Date(expense.created_at).toLocaleDateString('es-AR')}</td>
                                    <td className="p-3 text-right text-red-400 font-bold">-${Math.abs(Number(expense.amount)).toLocaleString()}</td>
                                </tr>
                            ))}
                            {payments.filter(p => Number(p.amount) < 0).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-gray-500 italic">No hay gastos registrados aún.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense Modal */}
            <AnimatePresence>
                {showExpenseModal && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowExpenseModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1c1c1e] rounded-2xl border border-white/10 max-w-md w-full p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-white">💸 Registrar Gasto</h2>
                                <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Concepto</label>
                                    <input
                                        type="text"
                                        value={newExpense.concepto}
                                        onChange={(e) => setNewExpense({ ...newExpense, concepto: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        placeholder="Ej: Alquiler mensual"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Monto</label>
                                    <input
                                        type="number"
                                        value={newExpense.monto}
                                        onChange={(e) => setNewExpense({ ...newExpense, monto: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Fecha</label>
                                    <input
                                        type="date"
                                        value={newExpense.fecha}
                                        onChange={(e) => setNewExpense({ ...newExpense, fecha: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Categoría</label>
                                    <select
                                        value={newExpense.categoria}
                                        onChange={(e) => setNewExpense({ ...newExpense, categoria: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    >
                                        <option value="Fijo">Fijo</option>
                                        <option value="Variable">Variable</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Inversión">Inversión</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleAddExpense}
                                    className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all"
                                >
                                    Guardar Gasto
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
