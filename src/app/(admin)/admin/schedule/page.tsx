'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ScheduleItem {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
    activity: {
        id: string;
        name: string;
        color: string;
        duration_minutes: number;
    };
    coach?: {
        id: string;
        first_name: string;
        last_name: string;
    };
    teacher_text?: string;
}

interface Activity {
    id: string;
    name: string;
    duration_minutes: number;
}

interface Coach {
    id: string;
    first_name: string;
    last_name: string;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_INDEX_MAP: Record<number, string> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
};

export default function AdminSchedulePage() {
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    // const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        activity_id: '',
        coach_id: '', // Optional
        teacher_text: '', // Optional fallback
        day_of_week: 1, // Default Lunes
        start_time: '09:00',
        end_time: '10:00',
        is_active: true
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [scheduleRes, activitiesRes, coachesRes] = await Promise.all([
                fetch('/api/schedule'), // Reusing public GET for now
                fetch('/api/admin/activities'),
                fetch('/api/admin/users?role=coach') // Need to ensure this endpoint exists or filter all users
            ]);

            const scheduleData = await scheduleRes.json();
            const activitiesData = await activitiesRes.json();

            // For coaches, we might need a specific endpoint or just fetch profiles
            // Assuming we can get them somehow. For now, mocking or empty.
            // Let's assume we implement a specific route /api/admin/coaches later.
            // For now, let's just use the profiles if returned by activities or separate call.
            // I'll create a quick helper to fetch coaches if needed.
            // Actually, /api/admin/users is not standard yet. Let's assume empty for now or fix later.
            // setsCoaches([]); // Eliminar referencia a variable inexistente

            if (Array.isArray(scheduleData)) {
                // Map the data structure to match ScheduleItem interface
                const mappedSchedule = scheduleData.map((item: any) => ({
                    id: item.id,
                    day_of_week: item.day_of_week,
                    start_time: item.start_time,
                    end_time: item.end_time,
                    is_active: item.is_active,
                    activity: item.activities,
                    coach: item.profiles,
                    teacher_text: item.teacher_text
                }));
                setSchedule(mappedSchedule);
            }
            if (Array.isArray(activitiesData)) setActivities(activitiesData);

        } catch (_error) {
            toast.error('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item?: ScheduleItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                activity_id: item.activity.id,
                coach_id: item.coach?.id || '',
                teacher_text: item.teacher_text || '',
                day_of_week: item.day_of_week,
                start_time: item.start_time,
                end_time: item.end_time,
                is_active: item.is_active
            });
        } else {
            setEditingItem(null);
            setFormData({
                activity_id: activities[0]?.id || '',
                coach_id: '',
                teacher_text: '',
                day_of_week: 1,
                start_time: '09:00',
                end_time: '10:00',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `/api/admin/schedule?id=${editingItem.id}` : '/api/admin/schedule';

            // Basic validation
            if (!formData.activity_id) return toast.error('Selecciona una actividad');

            // Time range validation
            const startHour = parseInt(formData.start_time.split(':')[0]);
            const endHour = parseInt(formData.end_time.split(':')[0]);

            const isWeekDay = formData.day_of_week >= 1 && formData.day_of_week <= 5;
            const isSaturday = formData.day_of_week === 6;

            if (isWeekDay && (startHour < 9 || endHour > 23)) {
                return toast.error('Horario permitido Lunes-Viernes: 09:00 a 23:00');
            }
            if (isSaturday && (startHour < 9 || endHour > 18)) {
                return toast.error('Horario permitido Sábados: 09:00 a 18:00');
            }

            const body = {
                ...formData,
                profile_id: formData.coach_id || null // Map coach_id to profile_id for DB
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Error al guardar');

            toast.success(editingItem ? 'Clase actualizada' : 'Clase creada');
            setIsModalOpen(false);
            fetchInitialData();
        } catch (_error) {
            toast.error('Ocurrió un error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta clase del horario?')) return;
        try {
            const res = await fetch(`/api/admin/schedule?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('Clase eliminada');
            fetchInitialData();
        } catch {
            toast.error('Error al eliminar');
        }
    };

    // Helper to get items for a specific day
    const getItemsForDay = (dayIndex: number) => {
        // dayIndex comes from 0-5 (Lunes-Sábado), but DB uses 1-6
        const dbDayIndex = dayIndex + 1;
        return schedule
            .filter(item => item.day_of_week === dbDayIndex)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
    };

    if (loading) return <div className="p-8 text-white">Cargando horario...</div>;

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white">Gestión de Horarios</h1>
                    <p className="text-gray-400">Organiza las clases semanales del gimnasio</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-bold shadow-lg"
                >
                    <Plus size={20} /> Nueva Clase
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {DAYS.map((day, index) => (
                    <div key={day} className="bg-[#1c1c1e] border border-white/5 rounded-xl p-4 flex flex-col h-full min-h-[200px]">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <CalendarIcon size={18} className="text-purple-400" /> {day}
                        </h3>

                        <div className="space-y-3 flex-1">
                            {getItemsForDay(index).map((item) => (
                                <motion.div
                                    key={item.id}
                                    layoutId={item.id}
                                    className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-3 cursor-pointer group relative overflow-hidden"
                                    onClick={() => handleOpenModal(item)}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: item.activity.color }} />

                                    <div className="pl-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-mono text-gray-400">{item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p className="font-bold text-white text-sm truncate">{item.activity.name}</p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {item.coach ? `${item.coach.first_name} ${item.coach.last_name}` : (item.teacher_text || 'Sin instructor')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {getItemsForDay(index).length === 0 && (
                                <div className="text-center py-8 text-gray-600 text-sm">
                                    Sin clases
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#2c2c2e] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">
                                    {editingItem ? 'Editar Clase' : 'Nueva Clase'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Día</label>
                                        <select
                                            value={formData.day_of_week}
                                            onChange={e => setFormData({ ...formData, day_of_week: Number(e.target.value) })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {Object.entries(DAY_INDEX_MAP).map(([val, label]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Actividad</label>
                                        <select
                                            value={formData.activity_id}
                                            onChange={e => setFormData({ ...formData, activity_id: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {activities.map(act => (
                                                <option key={act.id} value={act.id}>{act.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Inicio</label>
                                        <input
                                            type="time"
                                            value={formData.start_time}
                                            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Fin</label>
                                        <input
                                            type="time"
                                            value={formData.end_time}
                                            onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Instructor (Opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.teacher_text}
                                        onChange={e => setFormData({ ...formData, teacher_text: e.target.value })}
                                        placeholder="Nombre del instructor (si no tiene perfil)"
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Dejar vacío para asignar un Coach registrado (Próximamente selector de Coach)
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-600 bg-black/30 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-300 select-none cursor-pointer">
                                        Clase disponible
                                    </label>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-lg transition-colors flex justify-center items-center gap-2"
                                    >
                                        <Save size={18} /> Guardar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
