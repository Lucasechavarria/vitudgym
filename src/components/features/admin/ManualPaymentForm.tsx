'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ManualPaymentFormProps {
    onSuccess?: () => void;
}

/**
 * Componente para que admin apruebe pagos en efectivo
 */
export default function ManualPaymentForm({ onSuccess }: ManualPaymentFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        amount: '',
        concept: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('auth-token');

            const response = await fetch('/api/payments/manual-approval', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: formData.userId,
                    amount: Number(formData.amount),
                    concept: formData.concept,
                    notes: formData.notes
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Pago aprobado exitosamente');
                setFormData({ userId: '', amount: '', concept: '', notes: '' });
                onSuccess?.();
            } else {
                alert('❌ Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al aprobar el pago');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1c1c1e] p-6 rounded-2xl border border-[#3a3a3c]"
        >
            <h2 className="text-2xl font-bold text-white mb-6">
                💵 Aprobar Pago en Efectivo
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* User ID */}
                <div>
                    <label className="block text-gray-300 mb-2 text-sm font-bold">
                        ID de Usuario
                    </label>
                    <input
                        type="text"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        className="w-full bg-[#0a0a0a] text-white border border-[#3a3a3c] rounded-lg p-3"
                        placeholder="user_123"
                        required
                    />
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-gray-300 mb-2 text-sm font-bold">
                        Monto (ARS)
                    </label>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full bg-[#0a0a0a] text-white border border-[#3a3a3c] rounded-lg p-3"
                        placeholder="15000"
                        required
                    />
                </div>

                {/* Concept */}
                <div>
                    <label className="block text-gray-300 mb-2 text-sm font-bold">
                        Concepto
                    </label>
                    <input
                        type="text"
                        value={formData.concept}
                        onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                        className="w-full bg-[#0a0a0a] text-white border border-[#3a3a3c] rounded-lg p-3"
                        placeholder="Cuota Mensual Enero 2025"
                        required
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-gray-300 mb-2 text-sm font-bold">
                        Notas (Opcional)
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-[#0a0a0a] text-white border border-[#3a3a3c] rounded-lg p-3 resize-none"
                        placeholder="Pago recibido por recepción..."
                        rows={3}
                    />
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className={`w-full py-4 rounded-xl font-bold text-lg ${loading
                            ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500'
                        }`}
                >
                    {loading ? '⏳ Procesando...' : '✅ Aprobar Pago'}
                </motion.button>
            </form>
        </motion.div>
    );
}
