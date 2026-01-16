'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function DebugPage() {
    const supabase = createClient();
    const [authData, setAuthData] = useState<any>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            // 1. Get Auth User (JWT)
            const { data: { user } } = await supabase.auth.getUser();
            setAuthData(user);

            if (user) {
                // 2. Get DB Profile
                const { data: profile, error } = await supabase
                    .from('perfiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setProfileData({ data: profile, error });
            }
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) return <div className="p-8 text-black dark:text-white">Cargando datos de debug...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono text-sm">
            <h1 className="text-2xl font-bold text-red-500 mb-4">🕵️ Debugger de Roles</h1>

            <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-700 p-4 rounded">
                    <h2 className="text-xl font-bold mb-2 text-blue-400">1. Auth User (JWT)</h2>
                    <pre className="whitespace-pre-wrap break-all bg-gray-900 p-2 rounded">
                        {JSON.stringify(authData, null, 2)}
                    </pre>
                    <p className="mt-2 text-gray-400">
                        * Este es tu usuario de logueo. Fíjate en `app_metadata.role` o `user_metadata`.
                    </p>
                </div>

                <div className="border border-gray-700 p-4 rounded">
                    <h2 className="text-xl font-bold mb-2 text-green-400">2. DB Profile (Tabla &apos;perfiles&apos;)</h2>
                    <pre className="whitespace-pre-wrap break-all bg-gray-900 p-2 rounded">
                        {JSON.stringify(profileData, null, 2)}
                    </pre>
                    <p className="mt-2 text-gray-400">
                        * Esta es tu ficha real en la base de datos. <br />
                        Si aquí `role` dice &quot;member&quot; pero tú quieres ser &quot;admin&quot;,
                        tienes que editarlo manualmente en la tabla `perfiles` de Supabase.
                    </p>
                </div>
            </div>
        </div>
    );
}
