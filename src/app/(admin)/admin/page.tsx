import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import SuperAdminOverview from '@/components/features/admin/SuperAdminDashboard';
import GymAdminDashboard from '@/components/features/admin/GymAdminDashboard';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Si no hay sesión, redirigir al login
    if (authError || !user) {
        redirect('/login');
    }

    // Usar el admin client para leer el perfil — evita problemas de RLS recursiva
    // La validación de la sesión ya se hizo arriba con createClient()
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
        .from('perfiles')
        .select('rol, gimnasio_id, nombre_completo, onboarding_completado')
        .eq('id', user.id)
        .single();

    if (profile?.rol === 'superadmin') {
        return <SuperAdminOverview />;
    }

    if (profile?.rol === 'admin') {
        return <GymAdminDashboard gymId={profile?.gimnasio_id || ''} />;
    }

    // Roles que no deben estar aquí → redirigir
    if (profile?.rol === 'coach') {
        redirect('/coach');
    }

    if (profile?.rol === 'member') {
        redirect('/dashboard');
    }

    // Fallback: Sin perfil o rol desconocido
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Acceso Restringido</h2>
            <p className="text-gray-500 mt-2">No tienes permisos para acceder a esta sección.</p>
            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-left text-xs text-gray-400 font-mono">
                <p>User ID: {user.id}</p>
                <p>Rol detectado: {profile?.rol || 'null (sin perfil)'}</p>
            </div>
        </div>
    );
}
