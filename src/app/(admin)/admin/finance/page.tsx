'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Line, Bar } from 'recharts';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MOCK_REVENUE_DATA = [
    { month: 'Ene', ingresos: 38000, gastos: 15000 },
    { month: 'Feb', ingresos: 42000, gastos: 18000 },
    { month: 'Mar', ingresos: 45000, gastos: 17500 },
    { month: 'Abr', ingresos: 48000, gastos: 19000 },
    { month: 'May', ingresos: 44000, gastos: 18500 },
    { month: 'Jun', ingresos: 50000, gastos: 20000 },
];

const MOCK_EXPENSES = [
    { id: 1, concepto: 'Alquiler Gimnasio', monto: 8000, fecha: '2025-06-01', categoria: 'Fijo' },
    { id: 2, concepto: 'Equipamiento Nuevo', monto: 3500, fecha: '2025-06-10', categoria: 'Inversión' },
    { id: 3, concepto: 'Servicios (Luz, Agua)', monto: 1200, fecha: '2025-06-15', categoria: 'Variable' },
    { id: 4, concepto: 'Salarios Staff', monto: 6500, fecha: '2025-06-01', categoria: 'Fijo' },
    { id: 5, concepto: 'Marketing Digital', monto: 800, fecha: '2025-06-20', categoria: 'Marketing' },
];

export default function FinancePage() {
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        concepto: '',
        monto: '',
        fecha: '',
        categoria: 'Variable'
    });

    const handleAddExpense = async () => {
        if (!newExpense.concepto || !newExpense.monto || !newExpense.fecha) {
            toast.error('Completa todos los campos');
            return;
        }

        try {
            const res = await fetch('/api/admin/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concept: newExpense.concepto,
                    amount: -Math.abs(parseFloat(newExpense.monto)), // Gasto siempre negativo
                    status: 'approved',
                    payment_method: 'manual',
                    payment_provider: 'internal',
                    notes: `Gasto - Categoría: ${newExpense.categoria}`,
                    metadata: { category: newExpense.categoria, expense_date: newExpense.fecha }
                })
            });

            if (!res.ok) throw new Error('Error al guardar');

            toast.success('Gasto registrado exitosamente');
            setShowExpenseModal(false);
            setNewExpense({ concepto: '', monto: '', fecha: '', categoria: 'Variable' });
            // Ideally re-fetch data here if we had a GET for expenses
        } catch (error: any) {
            toast.error(error.message || 'Error al registrar gasto');
        }
    };

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
                    { label: 'Ingresos Totales', value: '$50,000', trend: '+12%', color: 'text-green-500', icon: '📈' },
                    { label: 'Gastos Totales', value: '$20,000', trend: '-5%', color: 'text-red-500', icon: '📉' },
                    { label: 'Balance Neto', value: '$30,000', trend: '+18%', color: 'text-blue-500', icon: '💵' },
                    { label: 'Tasa de Retención', value: '94%', trend: '+2%', color: 'text-purple-500', icon: '🎯' },
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
                        <LineChart data={MOCK_REVENUE_DATA}>
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
                        <BarChart data={[
                            { categoria: 'Fijo', valor: 14500 },
                            { categoria: 'Variable', valor: 1200 },
                            { categoria: 'Marketing', valor: 800 },
                            { categoria: 'Inversión', valor: 3500 },
                        ]}>
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
                    {[
                        { user: 'Juan Pérez', amount: '$120', type: 'Pago Mensual', date: 'Hace 2 horas', isIncome: true },
                        { user: 'María González', amount: '$85', type: 'Clase Individual', date: 'Hace 5 horas', isIncome: true },
                        { user: 'Proveedor XYZ', amount: '-$350', type: 'Equipamiento', date: 'Ayer', isIncome: false },
                    ].map((tx, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                            <div>
                                <p className="font-bold text-white">{tx.user}</p>
                                <p className="text-xs text-gray-400">{tx.type} • {tx.date}</p>
                            </div>
                            <p className={`text-lg font-bold ${tx.isIncome ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.amount}
                            </p>
                        </div>
                    ))}
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
                            {MOCK_EXPENSES.map(expense => (
                                <tr key={expense.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 text-white font-medium">{expense.concepto}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-bold">
                                            {expense.categoria}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-400">{new Date(expense.fecha).toLocaleDateString('es-AR')}</td>
                                    <td className="p-3 text-right text-red-400 font-bold">-${expense.monto}</td>
                                </tr>
                            ))}
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
