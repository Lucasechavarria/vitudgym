'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface StudentDetail {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    role: string;
    onboarding_completed: boolean;
    created_at: string;

    // Medical info
    height: number;
    weight: number;
    medical_conditions: string[];
    injuries: string[];
    medications: string[];
    fitness_level: string;

    // Goals
    primary_goal: string;
    target_weight: number;
    weekly_training_days: number;

    // Coach notes
    coach_observations: string;
}

interface Routine {
    id: string;
    name: string;
    status: string;
    created_at: string;
}

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'goals' | 'routines'>('info');
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    useEffect(() => {
        if (studentId) {
            loadStudentDetail();
        }
    }, [studentId]);

    const loadStudentDetail = async () => {
        try {
            const response = await fetch(`/api/coach/students/${studentId}`);
            const data = await response.json();

            if (data.success) {
                setStudent(data.student);
                setRoutines(data.routines || []);
                setNotes(data.student.coach_observations || '');
            } else {
                toast.error('Error al cargar alumno');
                router.push('/coach/students');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar alumno');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateRoutine = async () => {
        setGenerating(true);
        try {
            const response = await fetch('/api/ai/generate-routine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: studentId })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Rutina generada exitosamente');
                setShowGenerateModal(false);
                loadStudentDetail();
            } else {
                toast.error(data.error || 'Error al generar rutina');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al generar rutina');
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            const response = await fetch(`/api/coach/students/${studentId}/notes`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Notas guardadas');
            } else {
                toast.error('Error al guardar notas');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al guardar notas');
        } finally {
            setSavingNotes(false);
        }
    };

    const calculateAge = (dateOfBirth: string) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const calculateBMI = (weight: number, height: number) => {
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Cargando información del alumno...</div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Alumno no encontrado</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.push('/coach/students')}
                            className="text-gray-400 hover:text-white mb-2 flex items-center gap-2"
                        >
                            ← Volver a alumnos
                        </button>
                        <h1 className="text-3xl font-bold text-white mb-2">👤 {student.full_name}</h1>
                        <p className="text-gray-400">{student.email}</p>
                    </div>
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                    >
                        ✨ Generar Rutina con IA
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="text-gray-400 text-sm mb-1">Edad</div>
                        <div className="text-2xl font-bold text-white">{calculateAge(student.date_of_birth)} años</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="text-gray-400 text-sm mb-1">Peso</div>
                        <div className="text-2xl font-bold text-white">{student.weight} kg</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="text-gray-400 text-sm mb-1">Altura</div>
                        <div className="text-2xl font-bold text-white">{student.height} cm</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="text-gray-400 text-sm mb-1">IMC</div>
                        <div className="text-2xl font-bold text-white">{calculateBMI(student.weight, student.height)}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-gray-800 rounded-lg mb-6 p-1 flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'info' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        📋 Información
                    </button>
                    <button
                        onClick={() => setActiveTab('medical')}
                        className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'medical' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        🏥 Historial Médico
                    </button>
                    <button
                        onClick={() => setActiveTab('goals')}
                        className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'goals' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        🎯 Objetivos
                    </button>
                    <button
                        onClick={() => setActiveTab('routines')}
                        className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${activeTab === 'routines' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        💪 Rutinas ({routines.length})
                    </button>
                </div>

                {/* Info Tab */}
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4">Datos Personales</h2>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-gray-400 text-sm">Teléfono</div>
                                    <div className="text-white">{student.phone || 'No especificado'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Género</div>
                                    <div className="text-white capitalize">{student.gender}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Fecha de Nacimiento</div>
                                    <div className="text-white">{new Date(student.date_of_birth).toLocaleDateString('es-AR')}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Miembro desde</div>
                                    <div className="text-white">{new Date(student.created_at).toLocaleDateString('es-AR')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-bold text-white mb-4">Notas del Coach</h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Agrega observaciones sobre el alumno..."
                                className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none mb-4"
                            />
                            <button
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
                            >
                                {savingNotes ? 'Guardando...' : 'Guardar Notas'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Medical Tab */}
                {activeTab === 'medical' && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-6">Historial Médico</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Nivel de Fitness</h3>
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <div className="text-orange-400 font-bold capitalize">{student.fitness_level}</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Condiciones Médicas</h3>
                                {student.medical_conditions && student.medical_conditions.length > 0 ? (
                                    <div className="space-y-2">
                                        {student.medical_conditions.map((condition, index) => (
                                            <div key={index} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300">
                                                ⚠️ {condition}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-700 rounded-lg p-4 text-gray-400">
                                        Sin condiciones médicas reportadas
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Lesiones</h3>
                                {student.injuries && student.injuries.length > 0 ? (
                                    <div className="space-y-2">
                                        {student.injuries.map((injury, index) => (
                                            <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-300">
                                                🩹 {injury}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-700 rounded-lg p-4 text-gray-400">
                                        Sin lesiones reportadas
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Medicamentos</h3>
                                {student.medications && student.medications.length > 0 ? (
                                    <div className="space-y-2">
                                        {student.medications.map((medication, index) => (
                                            <div key={index} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-300">
                                                💊 {medication}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-700 rounded-lg p-4 text-gray-400">
                                        Sin medicamentos reportados
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Goals Tab */}
                {activeTab === 'goals' && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-6">Objetivos</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6">
                                <div className="text-orange-100 text-sm mb-2">Objetivo Principal</div>
                                <div className="text-2xl font-bold text-white capitalize">{student.primary_goal}</div>
                            </div>

                            <div className="bg-gray-700 rounded-lg p-6">
                                <div className="text-gray-400 text-sm mb-2">Peso Objetivo</div>
                                <div className="text-2xl font-bold text-white">{student.target_weight} kg</div>
                                <div className="text-sm text-gray-400 mt-1">
                                    {student.target_weight > student.weight ? '↗️ Aumentar' : '↘️ Reducir'} {Math.abs(student.target_weight - student.weight)} kg
                                </div>
                            </div>

                            <div className="bg-gray-700 rounded-lg p-6">
                                <div className="text-gray-400 text-sm mb-2">Días de Entrenamiento</div>
                                <div className="text-2xl font-bold text-white">{student.weekly_training_days} días/semana</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Routines Tab */}
                {activeTab === 'routines' && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-6">Rutinas Asignadas</h2>

                        {routines.length > 0 ? (
                            <div className="space-y-4">
                                {routines.map((routine) => (
                                    <div key={routine.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-white font-semibold">{routine.name}</div>
                                            <div className="text-sm text-gray-400">
                                                Creada: {new Date(routine.created_at).toLocaleDateString('es-AR')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${routine.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                    routine.status === 'pending_approval' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-gray-600 text-gray-400'
                                                }`}>
                                                {routine.status === 'active' ? '✓ Activa' :
                                                    routine.status === 'pending_approval' ? '⏳ Pendiente' :
                                                        'Inactiva'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">💪</div>
                                <div className="text-gray-400 mb-4">No hay rutinas asignadas</div>
                                <button
                                    onClick={() => setShowGenerateModal(true)}
                                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                                >
                                    Generar Primera Rutina
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Generate Routine Modal */}
                {showGenerateModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4">✨ Generar Rutina con IA</h2>
                            <p className="text-gray-400 mb-6">
                                La IA generará una rutina personalizada basada en:
                            </p>
                            <ul className="text-gray-300 space-y-2 mb-6">
                                <li>✓ Información médica del alumno</li>
                                <li>✓ Objetivos personales</li>
                                <li>✓ Nivel de fitness actual</li>
                                <li>✓ Equipamiento disponible</li>
                            </ul>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowGenerateModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleGenerateRoutine}
                                    disabled={generating}
                                    className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
                                >
                                    {generating ? 'Generando...' : 'Generar Rutina'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
