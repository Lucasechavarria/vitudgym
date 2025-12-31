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
        profile: null,
        isGoalModalOpen: false
    });

    const fetchData = async () => {
        try {
            const res = await fetch('/api/student/dashboard');
            if (!res.ok) throw new Error('Error cargando datos');
            const dashboardData = await res.json();
            setData((prev: any) => ({ ...prev, ...dashboardData }));
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
        setData((prev: any) => ({ ...prev, isGoalModalOpen: isOpen }));
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

            const result = await res.json().catch(() => ({ error: 'Error inesperado del servidor (HTML)' }));

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
        handleRequestRoutine,
        handleGoalModal,
        refreshData: fetchData
    };
}
