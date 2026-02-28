'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useGym } from '@/components/providers/GymProvider';

interface NavItem {
    href: string;
    label: string;
    icon: string;
    module?: string;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
    admin: [
        { href: '/admin', label: 'Panel de Control', icon: '📊' },
        { href: '/admin/users', label: 'Usuarios', icon: '👥' },
        { href: '/admin/challenges', label: 'Desafíos', icon: '⚔️', module: 'gamificacion' },
        { href: '/admin/activities', label: 'Actividades', icon: '🏅', module: 'clases_reserva' },
        { href: '/admin/equipment', label: 'Equipamiento', icon: '🔧' },
        { href: '/coach/routines', label: 'Rutinas', icon: '💪', module: 'rutinas_ia' },
        { href: '/admin/nutrition', label: 'Nutrición', icon: '🥗', module: 'nutricion_ia' },
        { href: '/coach/vision', label: 'Vision Lab', icon: '🎥', module: 'vision_ia' },
        { href: '/admin/finance', label: 'Finanzas', icon: '💰', module: 'pagos_online' },
        { href: '/admin/settings/branding', label: 'Personalización', icon: '🎨' },
        { href: '/admin/settings/landing', label: 'Marketing', icon: '🚀' },
        { href: '/admin/settings/support', label: 'Soporte Técnico', icon: '🎧' },
        { href: '/admin/settings', label: 'Configuración', icon: '⚙️' },
    ],
    superadmin: [
        { href: '/admin', label: 'Super Control', icon: '⚡' },
        { href: '/admin/gyms', label: 'Gimnasios', icon: '🏢' },
        { href: '/admin/plans', label: 'Planes', icon: '💎' },
        { href: '/admin/finance/billing', label: 'Cobros SaaS', icon: '💰' },
        { href: '/admin/support', label: 'Soporte Global', icon: '🎫' },
        { href: '/admin/users', label: 'Usuarios Globales', icon: '👥' },
        { href: '/admin/challenges', label: 'Desafíos', icon: '⚔️' },
        { href: '/coach', label: 'Vista Profesor', icon: '🏋️' },
        { href: '/dashboard', label: 'Vista Alumno', icon: '🎯' },
        { href: '/admin/activities', label: 'Actividades', icon: '🏅' },
        { href: '/admin/equipment', label: 'Equipamiento', icon: '🔧' },
        { href: '/coach/routines', label: 'Rutinas', icon: '💪' },
        { href: '/admin/nutrition', label: 'Nutrición', icon: '🥗' },
        { href: '/admin/finance', label: 'Finanzas', icon: '💰' },
        { href: '/admin/settings', label: 'Configuración', icon: '⚙️' },
    ],
    coach: [
        { href: '/coach', label: 'Dashboard', icon: '🏠' },
        { href: '/coach/messages', label: 'Mensajes', icon: '💬' },
        { href: '/schedule', label: 'Cronograma', icon: '🗓️', module: 'clases_reserva' },
        { href: '/coach/students', label: 'Alumnos', icon: '👥' },
        { href: '/coach/equipment', label: 'Equipamiento', icon: '🔧' },
        { href: '/coach/classes', label: 'Clases', icon: '📅', module: 'clases_reserva' },
        { href: '/coach/routines', label: 'Rutinas', icon: '💪', module: 'rutinas_ia' },
        { href: '/coach/metrics', label: 'Métricas', icon: '📊' },
        { href: '/coach/vision', label: 'Vision Lab', icon: '🎥', module: 'vision_ia' },
        { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
    ],
    member: [
        { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { href: '/dashboard/messages', label: 'Mensajes', icon: '💬' },
        { href: '/schedule', label: 'Cronograma', icon: '🗓️', module: 'clases_reserva' },
        { href: '/dashboard/routine', label: 'Mi Rutina', icon: '💪', module: 'rutinas_ia' },
        { href: '/dashboard/progress', label: 'Mi Progreso', icon: '📈', module: 'gamificacion' },
        { href: '/dashboard/classes', label: 'Mis Clases', icon: '📅', module: 'clases_reserva' },
        { href: '/dashboard/nutrition', label: 'Nutrición', icon: '🥗', module: 'nutricion_ia' },
        { href: '/dashboard/vision', label: 'Visión Lab', icon: '🎥', module: 'vision_ia' },
        { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
    ],
};

const ROLE_COLORS: Record<string, string> = {
    superadmin: 'red',
    admin: 'purple',
    coach: 'orange',
    member: 'blue',
};

export function UniversalSidebar({
    role,
    profileName,
    isOpen,
    setIsOpen,
    isMobile
}: {
    role: string;
    profileName: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isMobile: boolean;
}) {
    const pathname = usePathname();
    const { hasModule, gym } = useGym();
    const [visionBadgeCount, setVisionBadgeCount] = React.useState(0);

    // Fetch unread vision analyses
    React.useEffect(() => {
        if (role !== 'member') return;

        const fetchBadgeCount = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { count } = await supabase
                .from('videos_ejercicio')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', user.id)
                .eq('estado', 'analizado')
                .eq('visto_por_alumno', false);

            setVisionBadgeCount(count || 0);
        };

        fetchBadgeCount();

        // Realtime updates for badge
        const channel = supabase
            .channel('sidebar_vision_badges')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'videos_ejercicio' },
                () => fetchBadgeCount()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [role]);

    // Determine nav items based on path first, then fallback to role
    let viewRole = role;

    // Special handling for superadmin persona: Always show superadmin nav
    if (role === 'superadmin') {
        viewRole = 'superadmin';
    } else if (role === 'admin') {
        viewRole = 'admin';
    } else {
        if (pathname.startsWith('/coach')) viewRole = 'coach';
        else if (pathname.startsWith('/dashboard')) viewRole = 'member';
        else if (pathname.startsWith('/admin')) viewRole = 'admin';
    }

    const navItems = (NAV_BY_ROLE[viewRole] || NAV_BY_ROLE.member).filter(item => {
        if (!item.module) return true;
        // Always show all modules to superadmin
        if (role === 'superadmin') return true;
        return hasModule(item.module);
    });
    const color = ROLE_COLORS[viewRole] || 'blue'; // This line is now effectively unused for color classes

    return (
        <aside
            className={`
                ${isMobile ? 'fixed' : 'sticky'} 
                top-0 left-0 h-screen w-64 
                bg-[#1c1c1e]/60 backdrop-blur-xl border-r border-white/10 
                flex flex-col z-40
                transition-transform duration-300 ease-in-out
                ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
            `}
        >
            {/* Logo & Close Button */}
            <div className="p-6 shrink-0 flex justify-between items-center">
                <Link href={navItems[0].href} className="block relative h-10 w-32">
                    <Image
                        src={gym?.logo_url || "/logos/Logo-Fondo-Negro.png"}
                        alt={gym?.nombre || "VIRTUD"}
                        fill
                        className="object-contain"
                        sizes="128px"
                    />
                </Link>
                {/* Mobile Close Button */}
                {isMobile && (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        aria-label="Cerrar menú"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <div className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium relative ${isActive
                                    ? `bg-primary text-primary-foreground shadow-lg shadow-primary/20`
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl shrink-0" role="img" aria-label={item.label}>{item.icon}</span>
                                <span className="truncate flex-1">{item.label}</span>
                                {item.label === 'Visión Lab' && visionBadgeCount > 0 && (
                                    <span className="absolute right-2 top-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border border-[#1c1c1e]">
                                        {visionBadgeCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Profile */}
            <div className="p-4 border-t border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0`}>
                        {profileName?.charAt(0).toUpperCase() || 'M'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{profileName || 'Miembro'}</p>
                        <p className="text-xs text-gray-400 capitalize truncate">{role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
