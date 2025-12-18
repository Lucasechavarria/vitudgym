'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import RegistrationForm from '@/components/features/profile/RegistrationForm';
import { useAuth } from '@/components/providers/supabase-auth-provider';

export default function CompleteProfilePage() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) {
        // Handle loading state or redirect if protected route wrapper fails
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                            Completa tu Perfil
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Necesitamos algunos datos adicionales para garantizar tu seguridad y brindarte el mejor servicio.
                        </p>
                    </div>
                </header>

                <main>
                    <RegistrationForm userId={user.id} onComplete={() => router.push('/dashboard')} />
                </main>
            </div>
        </div>
    );
}
