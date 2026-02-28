import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Consume una cuota de IA de forma atómica.
 * Verifica disponibilidad, incrementa uso y registra auditoría en un solo paso.
 */
export async function consumeAIQuota(
    gymId: string,
    userId: string,
    type: 'routine' | 'nutrition' | 'vision' | 'chat'
): Promise<{ allowed: boolean; error?: string }> {
    const supabase = createAdminClient();

    const { data, error } = await (supabase as any).rpc('consume_ai_quota', {
        p_gym_id: gymId,
        p_user_id: userId,
        p_type: type
    });

    if (error) {
        console.error('Error in consumeAIQuota RPC:', error);
        return { allowed: false, error: 'Error del servidor al procesar cuota de IA' };
    }

    return {
        allowed: data?.success ?? false,
        error: data?.message
    };
}
