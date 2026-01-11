import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

interface Routine {
    id: string;
    name: string;
    goal?: string;
    exercises: any[];
    nutrition_plan_id?: string;
}

interface DashboardData {
    profile: any;
    routine: Routine | null;
    progress: any[];
    attendance: any[];
    volume: Array<{ week: string; volume: number }>;
}

export function useStudentDashboard() {
    const [loading, setLoading] = useState(true);
    const [isRequesting, setIsRequesting] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [data, setData] = useState<DashboardData>({
        progress: [],
        attendance: [],
        routine: null,
        profile: null,
        volume: []
    });

    const fetchData = async () => {
        try {
            setLoading(true);
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

    const handleGoalModal = (isOpen: boolean) => {
        setIsGoalModalOpen(isOpen);
    };

    const handleRequestRoutine = async (formData: { goal: string; frequency: number; includeNutrition: boolean }) => {
        try {
            setIsRequesting(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Sesión de usuario no encontrada.');

            const res = await fetch('/api/ai/generate-routine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: user.id,
                    goal: formData.goal,
                    frequency: formData.frequency,
                    includeNutrition: formData.includeNutrition
                })
            });

            const result = await res.json().catch(() => ({ error: 'Error inesperado del servidor' }));

            if (!res.ok) {
                throw new Error(result.error || 'Ocurrió un error al contactar con la IA.');
            }

            toast.success('¡Rutina generada por IA exitosamente! Tu coach la revisará pronto.');
            handleGoalModal(false);
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
        isGoalModalOpen,
        handleRequestRoutine,
        handleGoalModal,
        refreshData: fetchData
    };
}
