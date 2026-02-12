'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Payment {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'prorrogado' | 'vencido' | 'proximo_a_vencer';
    payment_method: string;
    created_at: string;
    approved_at: string | null;
    approved_by: string | null;
}

export default function AdminPaymentsPage() {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [showExtensionModal, setShowExtensionModal] = useState(false);
    const [extensionProcessing, setExtensionProcessing] = useState(false);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const response = await fetch('/api/admin/payments');
            const data = await response.json();

            if (data.success) {
                setPayments(data.payments);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar pagos');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (paymentId: string) => {
        setProcessing(true);
        try {
            const response = await fetch(`/api/payments/manual-approval`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, action: 'approve' })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Pago aprobado');
                setShowModal(false);
                loadPayments();
            } else {
                toast.error(data.error || 'Error al aprobar pago');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al aprobar pago');
        } finally {
            setProcessing(false);
        }
    };

    const handleExtend = async (paymentId: string) => {
        setExtensionProcessing(true);
        try {
            const response = await fetch(`/api/admin/payments/extend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Prórroga aplicada exitoamente (+7 días)');
                setShowExtensionModal(false);
                loadPayments();
            } else {
                toast.error(data.message || 'Error al aplicar prórroga');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al aplicar prórroga');
        } finally {
            setExtensionProcessing(false);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesStatus = !filterStatus || payment.status === filterStatus;
        const matchesSearch =
            payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.user_email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'prorrogado': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'vencido': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'proximo_a_vencer': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return '✓ Aprobado';
            case 'rejected': return '✕ Rechazado';
            case 'prorrogado': return '📅 Prorrogado';
            case 'vencido': return '⚠️ Vencido';
            case 'proximo_a_vencer': return '⏳ Por Vencer';
            default: return '⏳ Pendiente';
        }
    };

    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const approvedCount = payments.filter(p => p.status === 'approved').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Cargando pagos...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">💳 Gestión de Pagos</h1>
                    <p className="text-gray-400">Administra y aprueba pagos de membresías</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6">
                        <div className="text-orange-100 text-sm mb-1">Total Filtrado</div>
                        <div className="text-3xl font-bold text-white">${totalAmount.toLocaleString('es-AR')}</div>
                        <div className="text-orange-100 text-xs">{filteredPayments.length} pagos</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/30">
                        <div className="text-gray-400 text-sm mb-1">Pendientes</div>
                        <div className="text-3xl font-bold text-yellow-400">{pendingCount}</div>
                        <div className="text-gray-500 text-xs">Esperando aprobación</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-green-500/30">
                        <div className="text-gray-400 text-sm mb-1">Aprobados</div>
                        <div className="text-3xl font-bold text-green-400">{approvedCount}</div>
                        <div className="text-gray-500 text-xs">Este mes</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="text-gray-400 text-sm mb-1">Tasa de Aprobación</div>
                        <div className="text-3xl font-bold text-white">
                            {payments.length > 0 ? Math.round((approvedCount / payments.length) * 100) : 0}%
                        </div>
                        <div className="text-gray-500 text-xs">Del total</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Todos los estados</option>
                            <option value="pending">Pendientes</option>
                            <option value="approved">Aprobados</option>
                            <option value="rejected">Rechazados</option>
                            <option value="prorrogado">Prorrogados</option>
                            <option value="vencido">Vencidos</option>
                        </select>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">Monto</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">Método</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{payment.user_name || 'Sin nombre'}</div>
                                        <div className="text-xs text-gray-400">{payment.user_email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-bold">${payment.amount.toLocaleString('es-AR')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded capitalize">
                                            {payment.payment_method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                                            {getStatusLabel(payment.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 text-sm">
                                        {new Date(payment.created_at).toLocaleDateString('es-AR', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {payment.status === 'pending' || payment.status === 'prorrogado' ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs font-semibold"
                                                    aria-label={`Aprobar pago de ${payment.user_name}`}
                                                >
                                                    Aprobar
                                                </button>
                                            ) : null}

                                            {['pending', 'vencido', 'proximo_a_vencer'].includes(payment.status) && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setShowExtensionModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs font-semibold"
                                                    aria-label={`Prorrogar pago de ${payment.user_name}`}
                                                >
                                                    Prorrogar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredPayments.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            No se encontraron pagos
                        </div>
                    )}
                </div>

                {/* Approval Modal */}
                {showModal && selectedPayment && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4">✓ Aprobar Pago</h2>

                            <div className="mb-6">
                                <div className="text-gray-400 text-sm mb-2">Usuario:</div>
                                <div className="text-white font-semibold mb-4">{selectedPayment.user_name}</div>

                                <div className="text-gray-400 text-sm mb-2">Monto:</div>
                                <div className="text-white text-2xl font-bold mb-4">${selectedPayment.amount.toLocaleString('es-AR')}</div>

                                <div className="text-gray-400 text-sm mb-2">Método de Pago:</div>
                                <div className="text-white capitalize">{selectedPayment.payment_method}</div>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                                <p className="text-green-300 text-sm">
                                    ✓ El pago será marcado como aprobado y el usuario tendrá acceso completo.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedPayment(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedPayment.id)}
                                    disabled={processing}
                                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
                                >
                                    {processing ? 'Aprobando...' : 'Confirmar Aprobación'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Extension Modal */}
                {showExtensionModal && selectedPayment && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4">📅 Prorrogar 7 Días</h2>

                            <div className="mb-6">
                                <div className="text-gray-400 text-sm mb-2">Usuario:</div>
                                <div className="text-white font-semibold mb-4">{selectedPayment.user_name}</div>

                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                                    <h3 className="text-purple-300 font-bold mb-2">Reglas de Prórroga:</h3>
                                    <ul className="text-purple-200/80 text-sm list-disc list-inside space-y-1">
                                        <li>Se otorgan <strong>7 días adicionales</strong> para pagar.</li>
                                        <li>Máximo <strong>2 prórrogas</strong> por mensualidad.</li>
                                        <li>Mantiene la <strong>fecha de vencimiento original</strong> para el próximo mes (no desplaza el ciclo).</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowExtensionModal(false);
                                        setSelectedPayment(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleExtend(selectedPayment.id)}
                                    disabled={extensionProcessing}
                                    className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50"
                                >
                                    {extensionProcessing ? 'Aplicando...' : 'Confirmar Prórroga'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
