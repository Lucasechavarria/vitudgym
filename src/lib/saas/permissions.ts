import { createAdminClient } from '@/lib/supabase/admin';

export type SaaSFeature = 'vision_lab' | 'multi_branch' | 'ai_routines' | 'advanced_reports';

const PLAN_FEATURES: Record<string, SaaSFeature[]> = {
    'Básico': [],
    'Pro': ['vision_lab', 'ai_routines', 'multi_branch'],
    'Elite': ['vision_lab', 'ai_routines', 'multi_branch', 'advanced_reports']
};

/**
 * Verifica si un gimnasio tiene acceso a una funcionalidad específica.
 */
export async function checkFeatureAccess(gymId: string, feature: SaaSFeature): Promise<boolean> {
    const adminClient = createAdminClient() as any;

    const { data: gym, error } = await adminClient
        .from('gimnasios')
        .select(`
            id,
            planes_suscripcion (nombre, limite_sucursales, limite_usuarios)
        `)
        .eq('id', gymId)
        .single();

    if (error || !gym || !gym.planes_suscripcion) return false;

    const planName = gym.planes_suscripcion.nombre;
    const allowedFeatures = PLAN_FEATURES[planName] || [];

    return allowedFeatures.includes(feature);
}

/**
 * Obtiene los límites de capacidad de un gimnasio.
 */
export async function getGymLimits(gymId: string) {
    const adminClient = createAdminClient() as any;

    const { data, error } = await adminClient
        .from('gimnasios')
        .select(`
            planes_suscripcion (limite_sucursales, limite_usuarios)
        `)
        .eq('id', gymId)
        .single();

    if (error || !data) return { branches: 1, users: 50 };

    return {
        branches: data.planes_suscripcion.limite_sucursales,
        users: data.planes_suscripcion.limite_usuarios
    };
}
