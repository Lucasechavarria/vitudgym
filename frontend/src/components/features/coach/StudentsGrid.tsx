'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { StudentAction } from './StudentAction';

interface Student {
    id: string;
    nombre: string;
    email: string;
    experiencia: string;
    status: string;
    lastAttendance: string;
    nextClass: string;
    [key: string]: string | number; // Allow extra fields if needed or define strict
}

export default function StudentsGrid() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'alert' | 'active'>('all');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState<'routine' | 'chat' | 'progress' | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Fetch profiles with role 'member' (student)
                const { data: profiles, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .or('role.eq.member,role.eq.user') as { data: any[]; error: any };

                if (error) throw error;

                if (profiles) {
                    // Map to component structure
                    const formattedStudents = profiles.map(p => ({
                        id: p.id,
                        nombre: p.full_name || 'Sin Nombre',
                        email: p.email,
                        // Mocking extra fields for now until we have real analytics for them
                        experiencia: 'Nivel Intermedio',
                        status: 'active', // Default to active
                        lastAttendance: 'Reciente',
                        nextClass: 'Por agendar',
                        edad: 25 // Mock
                    }));
                    setStudents(formattedStudents as Student[]);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student => {
        const nameMatch = student.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = student.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return (nameMatch || emailMatch) && (filter === 'all' || student.status === filter);
    });

    if (loading) return <div className="text-white p-4">Cargando alumnos...</div>;

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#1c1c1e]/50 backdrop-blur-xl p-4 rounded-2xl border border-white/5 sticky top-0 z-10">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 group-focus-within:text-orange-500 transition-colors">🔍</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar alumno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    {['all', 'active', 'alert'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as 'all' | 'alert' | 'active')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${filter === f
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'alert' ? '⚠️ Atención' : '✅ Activos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {filteredStudents.map((student) => (
                        <motion.div
                            layout
                            key={student.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="group relative bg-[#1c1c1e] rounded-2xl border border-[#3a3a3c] overflow-hidden hover:border-orange-500/50 transition-colors duration-300"
                        >
                            {/* Background Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-transparent to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                            <div className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-xl font-bold shadow-inner">
                                            {student.nombre.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white group-hover:text-orange-400 transition-colors">
                                                {student.nombre}
                                            </h3>
                                            <p className="text-xs text-gray-400">{student.experiencia}</p>
                                        </div>
                                    </div>
                                    {student.status === 'alert' && (
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30 flex items-center gap-1"
                                        >
                                            ⚠️ Lesión
                                        </motion.div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-6 text-sm">
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <p className="text-gray-500 text-xs">Edad</p>
                                        <p className="font-medium text-white">{student.edad} años</p>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg">
                                        <p className="text-gray-500 text-xs">Asistencia</p>
                                        <p className="font-medium text-white">{student.lastAttendance}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                                    <StudentAction
                                        icon="💪"
                                        label="Rutina"
                                        onClick={() => { setSelectedStudent(student.id); setModalOpen('routine'); }}
                                        variant="primary"
                                    />
                                    <StudentAction
                                        icon="💬"
                                        label="Chat"
                                        onClick={() => { setSelectedStudent(student.id); setModalOpen('chat'); }}
                                    />
                                    <StudentAction
                                        icon="📊"
                                        label="Progreso"
                                        onClick={() => { setSelectedStudent(student.id); setModalOpen('progress'); }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 text-gray-500"
                >
                    <p className="text-4xl mb-4">👻</p>
                    <p>No se encontraron alumnos con ese nombre.</p>
                </motion.div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {modalOpen && selectedStudent && (
                    <ModalOverlay onClose={() => setModalOpen(null)}>
                        {modalOpen === 'routine' && (
                            <RoutineModal
                                student={students.find(s => s.id === selectedStudent)!}
                                onClose={() => setModalOpen(null)}
                            />
                        )}
                        {modalOpen === 'chat' && (
                            <ChatModal
                                student={students.find(s => s.id === selectedStudent)!}
                                onClose={() => setModalOpen(null)}
                            />
                        )}
                        {modalOpen === 'progress' && (
                            <ProgressModal
                                student={students.find(s => s.id === selectedStudent)!}
                                onClose={() => setModalOpen(null)}
                            />
                        )}
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </div>
    );
}

// Modal Overlay Component
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1c1c1e] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

interface StudentModalProps {
    student: Student;
    onClose: () => void;
}

// Routine Modal
function RoutineModal({ student, onClose }: StudentModalProps) {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white">💪 Rutina Activa</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="space-y-4">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h3 className="font-bold text-orange-400 mb-2">Hipertrofia Full Body - Semana 3/8</h3>
                    <p className="text-sm text-gray-400">Última modificación: Hace 5 días</p>
                </div>

                <div className="space-y-2">
                    <h4 className="font-bold text-white">Lunes - Tren Superior</h4>
                    {['Press Banca', 'Remo con Barra', 'Press Militar', 'Curl Bíceps'].map((ex, i) => (
                        <div key={i} className="p-3 bg-white/5 rounded-lg flex justify-between">
                            <span className="text-gray-300">{ex}</span>
                            <span className="text-gray-500 text-sm">4x10</span>
                        </div>
                    ))}
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all">
                    Ver Rutina Completa
                </button>
            </div>
        </div>
    );
}

// Chat Modal  
function ChatModal({ student, onClose }: StudentModalProps) {
    const [message, setMessage] = useState('');

    return (
        <div className="p-6 flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-white">💬 Chat con {student.nombre}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                <div className="text-right">
                    <div className="inline-block bg-orange-500 text-white p-3 rounded-2xl rounded-tr-sm">
                        Hola! ¿Cómo vas con la rutina?
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
                </div>
                <div className="text-left">
                    <div className="inline-block bg-white/10 text-white p-3 rounded-2xl rounded-tl-sm">
                        ¡Muy bien coach! Ya completé 3 días esta semana.
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Hace 1 hora</p>
                </div>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-xl font-bold transition-all">
                    Enviar
                </button>
            </div>
        </div>
    );
}

// Progress Modal
function ProgressModal({ student, onClose }: StudentModalProps) {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white">📊 Progreso de {student.nombre}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Días Entrenados', value: '12/16', color: 'text-green-400' },
                        { label: 'Asistencia', value: '94%', color: 'text-blue-400' },
                        { label: 'Progreso 1RM', value: '+12kg', color: 'text-orange-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-xl text-center">
                            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 p-4 rounded-xl">
                    <h4 className="font-bold text-white mb-3">Evolución Peso Corporal</h4>
                    <div className="h-40 flex items-end gap-2">
                        {[65, 68, 70, 72, 74, 75, 76].map((weight, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg" style={{ height: `${(weight / 80) * 100}%` }}></div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Sem 1</span>
                        <span>Sem 7</span>
                    </div>
                </div>

                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all">
                    Ver Historial Completo
                </button>
            </div>
        </div>
    );
}
