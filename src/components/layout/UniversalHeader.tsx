'use client';

import React from 'react';
import RoleSwitcher from '@/components/common/RoleSwitcher';

export function UniversalHeader({ currentRole, profileRole }: { currentRole: string; profileRole?: string }) {
    return (
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10">
            <div className="px-4 md:px-6 py-3 flex items-center justify-between">
                {/* Left side - could add breadcrumbs or search */}
                <div className="flex items-center gap-4">
                    {/* Placeholder for future features */}
                </div>

                {/* Right side - Role Switcher */}
                <div className="flex items-center gap-4">
                    <RoleSwitcher currentRole={currentRole} profileRole={profileRole} />
                </div>
            </div>
        </header>
    );
}
