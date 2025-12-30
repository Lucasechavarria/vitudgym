import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export function useStudentDashboard() {
    const [loading, setLoading] = useState(true);
    const [isRequesting, setIsRequesting] = useState(false);
    const [data, setData] = useState<any>({
        progress: [],
        attendance: [],
        routine: null,
        profile: null
    });

    const fetchData = async () => {
        try {
            const res = await fetch('/api/student/dashboard');
            if (!res.ok) throw new Error('Error cargando datos');
            const dashboardData = await res.json();
            setData(dashboardData);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar tu progreso');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequestRoutine = async () => {
        try {
            setIsRequesting(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const goal = prompt('¿Cuál es tu objetivo principal? (Ej: Ganar masa muscular, Perder peso, etc.)');
            if (!goal) return;

            const res = await fetch('/api/ai/generate-routine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: user.id,
                    goal: goal,
                    includeNutrition: true
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Error generando rutina');
            }

            toast.success('¡Rutina generada por IA! Tu coach la revisará y aprobará pronto.');
            await fetchData();
        } catch (error) {
            console.error('Error requesting routine:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al procesar la solicitud.';
            toast.error(errorMessage);
        } finally {
            setIsRequesting(false);
        }
    };

    return {
        data,
        loading,
        isRequesting,
        handleRequestRoutine,
        refreshData: fetchData
    };
}
