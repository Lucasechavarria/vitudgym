import React from 'react';
import { createClient } from '@/lib/supabase/server';
import SuperAdminOverview from '@/components/features/admin/SuperAdminDashboard';
import GymAdminDashboard from '@/components/features/admin/GymAdminDashboard';

export default async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch profile to check role and gym
    const { data: profile } = await supabase
        .from('perfiles')
        .select('rol, gimnasio_id')
        .eq('id', user?.id)
        .single();

    if (profile?.rol === 'superadmin') {
        return <SuperAdminOverview />;
    }

    if (profile?.rol === 'admin' || profile?.rol === 'entrenador') {
        return <GymAdminDashboard gymId={profile?.gimnasio_id || ''} />;
    }

    // Default Fallback
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Acceso Restringido</h2>
            <p className="text-gray-500 mt-2">No tienes permisos para acceder a esta sección.</p>
        </div>
    );
}

