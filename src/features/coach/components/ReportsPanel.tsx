'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface StudentReport {
    id: string;
    studentId: string;
    studentName: string;
    type: 'injury' | 'pain' | 'question' | 'concern';
    title: string;
    description: string;
    status: 'pending' | 'resolved';
    createdAt: string;
    resolvedAt?: string;
}

const MOCK_REPORTS: StudentReport[] = [
    {
        id: '1',
        studentId: 'student1',
        studentName: 'Ana Gómez',
        type: 'question',
        title: 'Ajuste de rutina',
        description: 'Necesito ajustar mi rutina porque tengo menos tiempo disponible',
        status: 'pending',
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        studentId: 'student2',
        studentName: 'Carlos Ruiz',
        type: 'pain',
        title: 'Dolor de espalda',
        description: 'Siento molestia en la espalda baja después de hacer peso muerto',
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
];

const TYPE_ICONS = {
    injury: '🏥',
    pain: '🔴',
    question: '❓',
    concern: '⚠️',
};

const TYPE_LABELS = {
    injury: 'Lesión',
    pain: 'Dolor',
    question: 'Consulta',
    concern: 'Preocupación',
};

export function ReportsPanel() {
    const [reports, setReports] = useState<StudentReport[]>(MOCK_REPORTS);
    const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const pendingReports = reports.filter(r => r.status === 'pending');

    const handleResolve = (reportId: string) => {
        setReports(reports.map(r =>
            r.id === reportId ? { ...r, status: 'resolved', resolvedAt: new Date().toISOString() } : r
        ));
        toast.success('Reporte marcado como resuelto');
        setSelectedReport(null);
    };

    return (
        <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    🔔 Reportes de Alumnos
                    {pendingReports.length > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            {pendingReports.length}
                        </span>
                    )}
                </h3>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all text-sm"
                >
                    + Crear Reporte
                </button>
            </div>

            {pendingReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl block mb-2">✅</span>
                    No hay reportes pendientes
                </div>
            ) : (
                <div className="space-y-3">
                    {pendingReports.map((report) => (
                        <div
                            key={report.id}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                                    {report.studentName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{TYPE_ICONS[report.type]}</span>
                                        <p className="font-bold text-white truncate">{report.studentName}</p>
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">{report.title}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedReport(report)}
                                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-lg transition-all font-medium text-sm shrink-0"
                            >
                                Ver
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* View Report Modal */}
            <AnimatePresence>
                {selectedReport && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedReport(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1c1c1e] rounded-2xl border border-white/10 max-w-md w-full p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-black text-white">Detalle del Reporte</h2>
                                <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-1">Alumno</p>
                                    <p className="text-white font-bold">{selectedReport.studentName}</p>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-1">Tipo</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{TYPE_ICONS[selectedReport.type]}</span>
                                        <span className="text-white font-bold">{TYPE_LABELS[selectedReport.type]}</span>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-1">Asunto</p>
                                    <p className="text-white font-bold">{selectedReport.title}</p>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-1">Descripción</p>
                                    <p className="text-white">{selectedReport.description}</p>
                                </div>

                                <button
                                    onClick={() => handleResolve(selectedReport.id)}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all"
                                >
                                    ✓ Marcar como Resuelto
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Report Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateReportModal onClose={() => setShowCreateModal(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}

function CreateReportModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        studentName: '',
        type: 'question' as 'injury' | 'pain' | 'question' | 'concern',
        title: '',
        description: '',
    });

    const handleSubmit = () => {
        if (!formData.studentName || !formData.title || !formData.description) {
            toast.error('Completa todos los campos');
            return;
        }


        toast.success('Reporte creado exitosamente');
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1c1c1e] rounded-2xl border border-white/10 max-w-md w-full p-6"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-white">Crear Reporte</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-2 font-bold text-sm">Alumno</label>
                        <input
                            type="text"
                            value={formData.studentName}
                            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            placeholder="Nombre del alumno"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2 font-bold text-sm">Tipo</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'injury' | 'pain' | 'question' | 'concern' })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        >
                            <option value="question">Consulta</option>
                            <option value="pain">Dolor</option>
                            <option value="injury">Lesión</option>
                            <option value="concern">Preocupación</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2 font-bold text-sm">Asunto</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            placeholder="Título breve"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2 font-bold text-sm">Descripción</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white h-32 resize-none"
                            placeholder="Describe el problema o consulta..."
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        Crear Reporte
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
