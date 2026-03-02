'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRAINING_GOALS, GYM_EQUIPMENT } from '@/lib/constants/gym';
import { AI_PROMPT_TEMPLATES } from '@/lib/constants/ai-templates';

/**
 * RoutineGenerator Component
 * 
 * Componente para generar rutinas de entrenamiento personalizadas usando IA.
 * Incluye selección de alumno, objetivo, y notas del coach.
 */
interface Exercise {
    name: string;
    description: string;
    instructions: string;
    sets: number;
    reps: string;
    rest_seconds: number;
    equipment: string[];
    muscle_group?: string;
    // New fields from 2.0
    tempo?: string;
    puntaje_base?: number;
    alerta_medica?: string;
    alternativa?: string;
}

interface Routine {
    name: string;
    description: string;
    exercises: Exercise[];
    metadata?: Record<string, any>;
    logros?: Record<string, any>;
}

interface Student {
    id: string;
    nombre_completo?: string;
    full_name?: string;
    name?: string;
    email: string;
    role?: string;
    informacion_medica?: Record<string, any>; // JSONB from DB
}

export default function RoutineGenerator({ initialTemplate }: { initialTemplate?: string | null } = {}) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [goal, setGoal] = useState<string>(TRAINING_GOALS[0]);
    const [coachNotes, setCoachNotes] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [studentsError, setStudentsError] = useState<string | null>(null);
    const [includeNutrition, setIncludeNutrition] = useState(true);
    const [nutritionPlan, setNutritionPlan] = useState<Record<string, any> | null>(null);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(initialTemplate || null);
    const [studentSessions, setStudentSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    // Initial Template Effect
    useEffect(() => {
        if (initialTemplate) {
            setSelectedTemplateKey(initialTemplate);

            // Try to find a matching goal name for the UI
            const templateData = (AI_PROMPT_TEMPLATES as any)[initialTemplate.toUpperCase()];
            if (templateData) {
                const matchedGoal = TRAINING_GOALS.find(g => g.toLowerCase() === templateData.label.toLowerCase());
                if (matchedGoal) setGoal(matchedGoal);
            } else {
                // Compatibility for old goal strings
                const matchedGoal = TRAINING_GOALS.find(g => g.toLowerCase() === initialTemplate.toLowerCase());
                if (matchedGoal) setGoal(matchedGoal);
            }
        }
    }, [initialTemplate]);

    // Fetch real students from Supabase
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoadingStudents(true);
                setStudentsError(null);
                const res = await fetch('/api/coach/students');
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Error al obtener alumnos');
                }

                if (data.students) {
                    setStudents(data.students);
                    if (data.students.length === 0) {
                        setStudentsError('No hay alumnos asignados');
                    }
                } else {
                    setStudentsError('Formato de respuesta inválido');
                }
            } catch (error: any) {
                console.error('Error fetching students:', error);
                setStudentsError(`Fallo al cargar alumnos: ${error.message || 'Error desconocido'}`);
                // Fallback to mock data for demo
                setStudents([
                    { id: 'demo1', full_name: 'Juan Pérez (Demo)', email: 'juan@demo.com' },
                    { id: 'demo2', full_name: 'María García (Demo)', email: 'maria@demo.com' },
                ]);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, []);

    // Fetch student session history when selected
    useEffect(() => {
        const fetchStudentSessions = async () => {
            if (!selectedStudent) {
                setStudentSessions([]);
                return;
            }

            try {
                setLoadingSessions(true);
                const res = await fetch(`/api/coach/students/${selectedStudent}/sessions?limit=5`);
                const data = await res.json();
                if (res.ok && data.sessions) {
                    setStudentSessions(data.sessions);
                }
            } catch (error) {
                console.error('Error fetching student sessions:', error);
            } finally {
                setLoadingSessions(false);
            }
        };

        fetchStudentSessions();
    }, [selectedStudent]);

    const selectedStudentData = students.find(s => s.id === selectedStudent);

    const [statusMessage, setStatusMessage] = useState<string>('');

    const generate = async () => {
        if (!selectedStudent) {
            alert('Por favor selecciona un alumno');
            return;
        }

        // 1. Validar conexión local
        if (typeof window !== 'undefined' && !window.navigator.onLine) {
            alert('⚠️ No tienes conexión a internet. Revisa tu wifi o datos móviles.');
            return;
        }

        setLoading(true);
        setRoutine(null);
        setStatusMessage('Conectando con VirtudCoach...');

        // 2. Control de tiempo de espera (Timeout de 60 segundos)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            setStatusMessage('Generando plan personalizado con IA...');
            const res = await fetch('/api/ai/generate-routine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal,
                body: JSON.stringify({
                    studentId: selectedStudent,
                    studentProfile: selectedStudentData,
                    goal,
                    templateKey: selectedTemplateKey,
                    coachNotes,
                    includeNutrition,
                    gymInventory: GYM_EQUIPMENT
                })
            });

            clearTimeout(timeoutId);
            setStatusMessage('Procesando respuesta...');

            const data = await res.json();

            if (res.ok && data.success) {
                setStatusMessage('¡Experiencia generada con éxito!');

                // Mapear la respuesta extendida
                const exercises = data.routine.exercises.map((ex: any) => ({
                    name: ex.name,
                    description: ex.description,
                    instructions: ex.instructions,
                    sets: ex.sets,
                    reps: ex.reps,
                    rest_seconds: ex.rest_seconds,
                    equipment: ex.equipment || [],
                    muscle_group: ex.muscle_group,
                }));

                const formattedRoutine: Routine = {
                    name: data.routine.name,
                    description: data.routine.description,
                    exercises: exercises,
                    metadata: data.rawAI?.rutina_metadata,
                    logros: data.rawAI?.sistema_de_logros
                };
                setRoutine(formattedRoutine);
                setNutritionPlan(data.nutritionPlan);
            } else {
                const errorMsg = data.error || data.message || 'Error desconocido al generar la rutina';
                alert('Error de VirtudCoach: ' + errorMsg);
            }
        } catch (e: unknown) {
            const error = e as any;
            if (error.name === 'AbortError') {
                alert('⏳ La conexión tardó demasiado. Por favor, intenta de nuevo.');
            } else {
                console.error('Fetch Error:', error);
                alert('Error de conexión: No se pudo contactar con el servidor. Revisa tu internet o intenta más tarde.');
            }
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    const handleSaveRoutine = async () => {
        if (!routine || !selectedStudent) return;

        setSaving(true);
        try {
            const res = await fetch('/api/routines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: selectedStudent,
                    name: routine.name || 'Rutina Personalizada',
                    goal: goal,
                    duration: '4', // Default duration if not from AI
                    description: routine.description || `Rutina generada para ${goal}`,
                    exercises: routine.exercises,
                    generatedByAI: true,
                    nutritionPlanId: nutritionPlan?.id
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Error al guardar rutina');
            }

            alert('✅ Rutina asignada y guardada exitosamente');
            setRoutine(null); // Reset
            setCoachNotes('');
        } catch (error) {
            console.error('Error saving routine:', error);
            alert('❌ Hubo un error al guardar la rutina');
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="space-y-6">
            {/* Input Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1c1c1e] p-4 md:p-8 rounded-2xl border border-[#3a3a3c]"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-orange-500">🤖</span> VirtudCoach 2.0
                    </h2>
                    <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full border border-orange-500/20 font-black tracking-widest uppercase">UX Architect Mode</span>
                </div>

                <div className="space-y-4">
                    {/* Student Selector */}
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm font-bold">
                            Alumno
                        </label>
                        {studentsError && (
                            <div className="mb-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                                <p className="text-yellow-400 text-xs">⚠️ {studentsError}</p>
                            </div>
                        )}
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full bg-[#0a0a0a] text-white border border-[#3a3a3c] rounded-lg p-3 focus:border-orange-500 focus:outline-none transition-colors"
                            disabled={loadingStudents}
                        >
                            <option value="">
                                {loadingStudents ? 'Cargando alumnos...' : 'Seleccionar alumno...'}
                            </option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.nombre_completo || student.full_name || student.name} - {student.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Medical Context & Session History */}
                    {selectedStudentData && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                        >
                            {/* Profile Info */}
                            <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-blue-300 text-sm font-bold mb-2">📋 Perfil Seleccionado:</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                                        {(selectedStudentData.nombre_completo || selectedStudentData.full_name || selectedStudentData.name || '?')[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-bold">{selectedStudentData.nombre_completo || selectedStudentData.full_name || selectedStudentData.name}</p>
                                        <p className="text-blue-200/50 text-[10px]">{selectedStudentData.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* New: Real-Time Session History */}
                            <div className="bg-purple-900/10 border border-purple-500/30 rounded-lg p-4">
                                <p className="text-purple-300 text-sm font-bold mb-2 flex justify-between">
                                    <span>⚡ Últimas Sesiones:</span>
                                    {loadingSessions && <span className="animate-pulse text-[10px]">Cargando...</span>}
                                </p>
                                {studentSessions.length > 0 ? (
                                    <div className="space-y-2">
                                        {studentSessions.map((session, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-[10px] bg-black/40 p-2 rounded border border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold">{new Date(session.start_time).toLocaleDateString()}</span>
                                                    <span className="text-purple-300/50 uppercase">{session.routine?.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-orange-500 font-black">{session.total_points} PTS</div>
                                                    <div className="text-gray-500">{session.mood_rating ? '😊'.repeat(session.mood_rating) : 'Sin mood'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-purple-300/40 italic">No hay historial de sesiones registrado aún.</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* 2. Select Goal */}
                <div className="mt-6">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Objetivo del Alumno</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {TRAINING_GOALS.map((t) => (
                            <button
                                key={t}
                                onClick={() => setGoal(t)}
                                className={`p-3 rounded-lg border text-[11px] font-bold transition-all ${goal === t
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Notes */}
                <div className="mt-6">
                    <label className="block text-gray-400 text-sm font-bold mb-2">Indicaciones Técnicas del Profesor</label>
                    <textarea
                        value={coachNotes}
                        onChange={(e) => setCoachNotes(e.target.value)}
                        placeholder="Ej: Foco en excéntrica lenta. Evitar press militar por dolor de hombro."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none h-20 text-sm resize-none"
                    />
                </div>

                {/* Nutrition Toggle */}
                <div className="mt-6 flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                    <input
                        type="checkbox"
                        id="includeNutrition"
                        checked={includeNutrition}
                        onChange={(e) => setIncludeNutrition(e.target.checked)}
                        className="w-5 h-5 accent-orange-500 rounded border-white/20 bg-black"
                    />
                    <label htmlFor="includeNutrition" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
                        🍎 Plan Nutricional Sugerido (Gamificado)
                    </label>
                </div>

                {/* Generate Button */}
                <button
                    onClick={generate}
                    disabled={loading || !selectedStudent}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex flex-col items-center justify-center gap-1"
                >
                    <div className="flex items-center gap-2">
                        {loading ? (
                            <span className="animate-pulse">Diseñando...</span>
                        ) : (
                            <>🚀 Generar Experiencia VirtudCoach</>
                        )}
                    </div>
                    {loading && statusMessage && (
                        <span className="text-[9px] text-white/50 font-normal italic">
                            {statusMessage}
                        </span>
                    )}
                </button>
            </motion.div>

            <AnimatePresence>
                {routine && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-8 space-y-6"
                    >
                        {/* Summary Header */}
                        <div className="bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded font-black border border-green-500/10">INTERACTIVA</span>
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-white">{routine.name}</h3>
                                    <p className="text-gray-400 text-sm mt-1 max-w-xl">
                                        Generada con enfoque en <span className="text-orange-500 font-bold">{goal}</span>.
                                        Duración estimada: <span className="text-white font-bold">{routine.metadata?.duracion_estimada_minutos || '45-60'} min</span>.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setRoutine(null)}
                                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                                    >
                                        Descartar
                                    </button>
                                    <button
                                        onClick={handleSaveRoutine}
                                        disabled={saving}
                                        className="px-6 py-2 bg-white text-black font-black text-xs rounded-lg hover:bg-orange-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
                                    >
                                        {saving ? 'Guardando...' : '💾 ASIGNAR A ALUMNO'}
                                    </button>
                                </div>
                            </div>

                            {/* Achievements Cards */}
                            {routine.logros && (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                                    <div className="text-center border-r border-white/5">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">Puntos Totales</p>
                                        <p className="text-xl font-black text-orange-500">{routine.logros.puntaje_maximo_sesion || 500}</p>
                                    </div>
                                    <div className="text-center border-r border-white/5">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">Por Ejercicio</p>
                                        <p className="text-xl font-black text-white">+{routine.logros.criterios_puntaje?.ejercicio_completado}</p>
                                    </div>
                                    <div className="text-center border-r border-white/5">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">Frecuencia</p>
                                        <p className="text-xl font-black text-white">{routine.metadata?.frecuencia_semanal}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase">Nivel</p>
                                        <p className="text-xl font-black text-white">{routine.metadata?.nivel_alumno || 'Medio'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Exercises List */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest px-2">Estructura de la Sesión</h4>
                            {routine.exercises && routine.exercises.map((ex, i) => (
                                <div key={i} className="group bg-[#1c1c1e] rounded-xl border border-white/5 hover:border-orange-500/50 transition-all overflow-hidden flex flex-col md:flex-row shadow-lg">
                                    {/* Order Flag */}
                                    <div className="w-1 md:w-2 bg-orange-600 group-hover:bg-orange-400 transition-colors" />

                                    <div className="p-5 flex-1 flex flex-col md:flex-row gap-6 items-center">
                                        {/* Main Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] text-orange-500 font-black">{ex.muscle_group || 'CORE'}</span>
                                                {ex.rest_seconds > 0 && (
                                                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        ⏱️ {ex.rest_seconds}s
                                                    </span>
                                                )}
                                            </div>
                                            <h5 className="font-bold text-white group-hover:text-orange-400 transition-colors uppercase italic tracking-tight">{ex.name}</h5>
                                            <p className="text-xs text-gray-400 line-clamp-2 mt-1 italic opacity-70 leading-relaxed font-medium">
                                                {ex.instructions}
                                            </p>
                                        </div>

                                        {/* Metrics Block */}
                                        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                                            <div className="md:w-24 bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                                                <p className="text-[8px] text-gray-500 font-bold uppercase mb-1">Series</p>
                                                <p className="text-lg font-black text-white">{ex.sets}</p>
                                            </div>
                                            <div className="md:w-24 bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                                                <p className="text-[8px] text-gray-500 font-bold uppercase mb-1">Reps</p>
                                                <p className="text-lg font-black text-white">{ex.reps}</p>
                                            </div>
                                        </div>

                                        {/* Interactive Status Display (Mock for Coach) */}
                                        <div className="hidden lg:flex flex-col items-end gap-2 pr-4 border-l border-white/5 pl-6">
                                            <div className="text-[10px] font-bold text-gray-600 uppercase">Input Alumno</div>
                                            <div className="flex gap-2">
                                                <div className="w-6 h-6 rounded border border-white/20 flex items-center justify-center opacity-30">✓</div>
                                                <div className="w-6 h-6 rounded border border-white/20 flex items-center justify-center opacity-30">!</div>
                                                <div className="w-6 h-6 rounded border border-white/20 flex items-center justify-center opacity-30">x</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Nutrition Plan Preview */}
                        {nutritionPlan && (
                            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1c1c1e] rounded-2xl p-6 border border-green-500/20 shadow-xl">
                                <h2 className="text-xl font-black mb-4 text-green-500 flex items-center gap-2">
                                    🍎 Fueling Plan <span className="text-[8px] bg-green-500/20 px-2 py-1 rounded text-green-400 border border-green-500/10 tracking-widest uppercase">Performance AI</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-tighter mb-1">Daily Target</p>
                                        <p className="text-lg font-black text-white tracking-widest">{nutritionPlan.daily_calories}<span className="text-[10px] text-gray-500 ml-1">kcal</span></p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-tighter mb-1">Proteins</p>
                                        <p className="text-lg font-black text-blue-400 tracking-widest">{nutritionPlan.protein_grams}<span className="text-[10px] text-gray-500 ml-1">g</span></p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-tighter mb-1">Carbs</p>
                                        <p className="text-lg font-black text-green-400 tracking-widest">{nutritionPlan.carbs_grams}<span className="text-[10px] text-gray-500 ml-1">g</span></p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-gray-500 text-[9px] uppercase font-bold tracking-tighter mb-1">Fats</p>
                                        <p className="text-lg font-black text-yellow-400 tracking-widest">{nutritionPlan.fats_grams}<span className="text-[10px] text-gray-500 ml-1">g</span></p>
                                    </div>
                                </div>
                                <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                                    <p className="text-[10px] text-orange-200 leading-relaxed font-medium">
                                        <span className="font-black text-orange-500 mr-2">DISCLAIMER PROFESIONAL:</span> Esta guía de alimentación ha sido optimizada por IA para el objetivo de {goal}. Representa una sugerencia técnica que el alumno debe validar con un profesional nutricionista. Al asignarla, el alumno recibirá este aviso de seguridad.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
