'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRAINING_GOALS, GYM_EQUIPMENT } from '@/lib/constants/gym';
import { AI_PROMPT_TEMPLATES, AITemplateKey } from '@/lib/constants/ai-templates';

/**
 * RoutineGenerator Component
 * 
 * Componente para generar rutinas de entrenamiento personalizadas usando IA.
 * Incluye selección de alumno, objetivo, y notas del coach.
 */
interface Exercise {
    exercise: string;
    notes: string;
    sets: number;
    reps: number;
    rest: number;
}

interface Routine {
    name: string;
    description: string;
    exercises: Exercise[];
}

interface Student {
    id: string;
    full_name?: string;
    name?: string;
    email: string;
    role?: string;
    medical_info?: any; // JSONB from DB
    // Falta tipado estricto pero 'any' aquí es seguro temporalmente para pasar al backend
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
    const [nutritionPlan, setNutritionPlan] = useState<any | null>(null);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(initialTemplate || null);

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

                if (!res.ok) {
                    throw new Error('Error al obtener alumnos');
                }

                const data = await res.json();
                if (data.students) {
                    // El endpoint ya devuelve solo alumnos con rol 'member'
                    setStudents(data.students);

                    if (data.students.length === 0) {
                        setStudentsError('No hay alumnos asignados');
                    }
                } else {
                    setStudentsError('No se pudieron cargar los alumnos');
                }
            } catch (error) {
                console.error('Error fetching students:', error);
                setStudentsError('Error al cargar alumnos. Verifica tu conexión.');
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

    const selectedStudentData = students.find(s => s.id === selectedStudent);

    const generate = async () => {
        if (!selectedStudent) {
            alert('Por favor selecciona un alumno');
            return;
        }

        setLoading(true);
        setRoutine(null);

        try {
            const res = await fetch('/api/ai/generate-routine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId: selectedStudent,
                    studentProfile: selectedStudentData, // Send full profile with medical info
                    goal,
                    templateKey: selectedTemplateKey,
                    coachNotes,
                    includeNutrition,
                    gymInventory: GYM_EQUIPMENT
                })
            });

            const data = await res.json();

            if (data.success) {
                setRoutine(data.routine);
                setNutritionPlan(data.nutritionPlan);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Error conectando con VirtudCoach');
        } finally {
            setLoading(false);
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
                <h2 className="text-xl font-bold text-white mb-6">🤖 VirtudCoach</h2>

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
                                    {student.full_name || student.name} - {student.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Medical Context Display */}
                    {selectedStudentData && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
                        >
                            <p className="text-blue-300 text-sm font-bold mb-2">📋 Datos del Alumno:</p>
                            <ul className="text-blue-200 text-xs space-y-1">
                                <li>👤 {selectedStudentData.full_name || selectedStudentData.name}</li>
                                <li>📧 {selectedStudentData.email}</li>
                            </ul>
                        </motion.div>
                    )}
                    {studentsError && <p className="text-red-400 text-xs mt-1">{studentsError}</p>}
                </div>

                {/* 2. Select Goal */}
                <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2">Objetivo</label>
                    <div className="grid grid-cols-2 gap-3">
                        {TRAINING_GOALS.map((t) => (
                            <button
                                key={t}
                                onClick={() => setGoal(t)}
                                className={`p-3 rounded-xl border text-sm font-bold transition-all ${goal === t
                                    ? 'bg-orange-500/20 border-orange-500 text-white'
                                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Notes */}
                <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2">Notas Adicionales (Opcional)</label>
                    <textarea
                        value={coachNotes}
                        onChange={(e) => setCoachNotes(e.target.value)}
                        placeholder="Ej: Tiene lesión en hombro derecho, prefiere mancuernas..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-orange-500 outline-none h-24 resize-none"
                    />
                </div>

                {/* Nutrition Toggle */}
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                    <input
                        type="checkbox"
                        id="includeNutrition"
                        checked={includeNutrition}
                        onChange={(e) => setIncludeNutrition(e.target.checked)}
                        className="w-5 h-5 accent-orange-500 rounded border-white/20 bg-black"
                    />
                    <label htmlFor="includeNutrition" className="text-sm font-bold text-white cursor-pointer select-none">
                        🍎 Incluir Plan Nutricional Sugerido (IA)
                    </label>
                </div>

                {/* Generate Button */}
                <button
                    onClick={generate}
                    disabled={loading || !selectedStudent}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>Generando Plan IA...</>
                    ) : (
                        <>✨ Generar Rutina</>
                    )}
                </button>
            </motion.div>

            <AnimatePresence>
                {routine && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-8 border-t border-white/10 pt-8"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Plan Generado</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setRoutine(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Descartar
                                </button>
                                <button
                                    onClick={handleSaveRoutine}
                                    disabled={saving}
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-70"
                                >
                                    {saving ? 'Guardando...' : '💾 Asignar Rutina'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="mb-6">
                                <h4 className="text-2xl font-black text-white mb-2">{routine.name}</h4>
                                <p className="text-gray-400">{routine.description}</p>
                            </div>

                            {/* Main Workout */}
                            <div className="mb-6">
                                <h2 className="text-xl font-black mb-3 text-orange-600">💪 Entrenamiento</h2>
                                {routine.exercises && routine.exercises.map((exercise: Exercise, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-black/20 rounded-lg border border-white/5 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-white">{exercise.exercise}</h5>
                                            <p className="text-sm text-gray-400">{exercise.notes}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-orange-400 font-bold">{exercise.sets} x {exercise.reps}</p>
                                            <p className="text-xs text-gray-500">{exercise.rest}s descanso</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Nutrition Plan Preview */}
                            {nutritionPlan && (
                                <div className="border-t border-white/10 pt-6">
                                    <h2 className="text-xl font-black mb-4 text-green-500 flex items-center gap-2">
                                        🍎 Plan Nutricional <span className="text-xs bg-green-500/20 px-2 py-1 rounded text-green-400 border border-green-500/20">Sugerencia IA</span>
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <p className="text-gray-500 text-[10px] uppercase font-bold">Calorías</p>
                                            <p className="text-white font-bold">{nutritionPlan.daily_calories} kcal</p>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <p className="text-gray-500 text-[10px] uppercase font-bold">Proteínas</p>
                                            <p className="text-blue-400 font-bold">{nutritionPlan.protein_grams}g</p>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <p className="text-gray-500 text-[10px] uppercase font-bold">Carbs</p>
                                            <p className="text-green-400 font-bold">{nutritionPlan.carbs_grams}g</p>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                            <p className="text-gray-500 text-[10px] uppercase font-bold">Grasas</p>
                                            <p className="text-yellow-400 font-bold">{nutritionPlan.fats_grams}g</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4 p-3 bg-white/5 border border-white/10 rounded-lg italic">
                                        <span className="text-orange-400 font-bold">⚠️ Nota para el Coach:</span> Esta es una guía generada por IA. Asegúrate de revisarla. Se mostrará al alumno con el siguiente aviso: "Esta es una guía de alimentación sugerida por IA para orientarte. Recordá que no reemplaza a un profesional: siempre consultá con un nutricionista para un plan a tu medida."
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
