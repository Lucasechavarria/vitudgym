'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';

interface ReportPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReportPaymentModal({ isOpen, onClose }: ReportPaymentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'transfer',
        reference: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let receiptUrl = '';

            // 1. Upload receipt if exists
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const { data, error: uploadError } = await supabase.storage
                    .from('receipts')
                    .upload(`${fileName}`, file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    // Continue without file but warn
                    toast.error('No se pudo subir el comprobante. Continúa con el reporte.');
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('receipts')
                        .getPublicUrl(fileName);
                    receiptUrl = publicUrl;
                }
            }

            // 2. Submit report
            const res = await fetch('/api/payments/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    receipt_url: receiptUrl // Add url to payload
                })
            });

            if (!res.ok) throw new Error('Error al enviar el reporte');

            toast.success('Pago informado correctamente. Tu profesor confirmará la recepción pronto.');
            onClose();
            // Reset form
            setFormData({
                amount: '',
                date: new Date().toISOString().split('T')[0],
                method: 'transfer',
                reference: '',
                notes: ''
            });
            setFile(null);

        } catch (error) {
            console.error(error);
            toast.error('Hubo un error al informar el pago');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#1c1c1e] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Informar Pago</h2>
                                <p className="text-gray-400 text-sm mb-6">
                                    Si realizaste una transferencia, avísanos los detalles para activar tu pase.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Monto Transferido
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                required
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg py-3 pl-8 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                                placeholder="15000"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Comprobante (Imagen/PDF)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Opcional pero recomendado.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Fecha del Pago
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            N° Comprobante / Referencia (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.reference}
                                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                            className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                            placeholder="Ej: 12345678"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Notas
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors h-24 resize-none"
                                            placeholder="Detalles adicionales..."
                                        />
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/30 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                                        >
                                            {isLoading ? 'Enviando...' : 'Informar Pago'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
