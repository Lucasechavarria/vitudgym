'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
    superadmin: [
        { href: '/admin', label: 'Panel de Control', icon: '📊' },
        { href: '/admin/users', label: 'Usuarios', icon: '👥' },
        { href: '/admin/activities', label: 'Actividades', icon: '🏅' },
        { href: '/coach/vision', label: 'Vision Lab', icon: '🎥' },
        { href: '/admin/finance', label: 'Finanzas', icon: '💰' },
        { href: '/admin/schedule', label: 'Horarios', icon: '📅' },
        { href: '/admin/settings', label: 'Configuración', icon: '⚙️' },
    ],
    admin: [
        { href: '/admin', label: 'Panel de Control', icon: '📊' },
        { href: '/admin/users', label: 'Usuarios', icon: '👥' },
        { href: '/admin/activities', label: 'Actividades', icon: '🏅' },
        { href: '/coach/vision', label: 'Vision Lab', icon: '🎥' },
        { href: '/admin/finance', label: 'Finanzas', icon: '💰' },
        { href: '/admin/settings', label: 'Configuración', icon: '⚙️' },
    ],
    coach: [
        { href: '/coach', label: 'Dashboard', icon: '🏠' },
        { href: '/coach/messages', label: 'Mensajes', icon: '💬' },
        { href: '/schedule', label: 'Cronograma', icon: '🗓️' },
        { href: '/coach/students', label: 'Alumnos', icon: '👥' },
        { href: '/coach/classes', label: 'Clases', icon: '📅' },
        { href: '/coach/routines', label: 'Rutinas', icon: '💪' },
        { href: '/coach/metrics', label: 'Métricas', icon: '📊' },
        { href: '/coach/vision', label: 'Vision Lab', icon: '🎥' },
        { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
    ],
    user: [
        { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { href: '/dashboard/messages', label: 'Mensajes', icon: '💬' },
        { href: '/schedule', label: 'Cronograma', icon: '🗓️' },
        { href: '/dashboard/routine', label: 'Mi Rutina', icon: '💪' },
        { href: '/dashboard/progress', label: 'Mi Progreso', icon: '📈' },
        { href: '/dashboard/classes', label: 'Mis Clases', icon: '📅' },
        { href: '/dashboard/nutrition', label: 'Nutrición', icon: '🥗' },
        { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
    ],
};

const ROLE_COLORS: Record<string, string> = {
    superadmin: 'purple',
    admin: 'purple',
    coach: 'orange',
    user: 'blue',
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

    // Determine nav items based on path first, then fallback to role
    let viewRole = role;
    
    // For admin and superadmin, always keep their role menu unless they explicitly want to see another view
    // (though for now, standardizing to their primary role menu as requested)
    if (role === 'superadmin' || role === 'admin') {
        viewRole = role;
    } else {
        if (pathname.startsWith('/coach')) viewRole = 'coach';
        else if (pathname.startsWith('/dashboard')) viewRole = 'user';
    }

    const navItems = NAV_BY_ROLE[viewRole] || NAV_BY_ROLE.user;
    const color = ROLE_COLORS[viewRole] || 'blue';

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
            {/* Logo */}
            <div className="p-6 shrink-0">
                <Link href={navItems[0].href} className="block relative h-10 w-32">
                    <Image
                        src="/logos/Logo-Fondo-Negro.png"
                        alt="VIRTUD"
                        fill
                        className="object-contain"
                        priority
                        sizes="128px"
                    />
                </Link>
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
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${isActive
                                    ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/20`
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl shrink-0">{item.icon}</span>
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Profile */}
            <div className="p-4 border-t border-[#3a3a3c] shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-${color}-500/20 text-${color}-500 flex items-center justify-center font-bold border border-${color}-500 shrink-0`}>
                        {profileName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{profileName || 'Usuario'}</p>
                        <p className="text-xs text-gray-400 capitalize truncate">{role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
