import React from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { ROLES } from '@/lib/constants/app';
import { UniversalLayoutWrapper } from '@/components/layout/UniversalLayoutWrapper';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('perfiles')
        .select('rol, nombre_completo')
        .eq('id', user.id)
        .single();

    if (!profile || ![ROLES.ADMIN].includes(profile.rol as any)) {
        return (
            <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Acceso Denegado</h1>
                <p className="mb-4 text-gray-300">No tienes permisos para ver el Panel de Administración.</p>
                <Link href="/dashboard" className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                    Volver al Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex relative overflow-hidden">
            <div className="aurora-bg" />

            <UniversalLayoutWrapper profileName={profile.nombre_completo} profileRole={profile.rol}>
                {children}
            </UniversalLayoutWrapper>

            <Toaster position="top-center" toastOptions={{
                style: { background: '#333', color: '#fff' },
            }} />
        </div>
    );
}
