'use client';

import React from 'react';
import { UniversalSidebar } from '@/components/layout/UniversalSidebar';
import { UniversalHeader } from '@/components/layout/UniversalHeader';

export function UniversalLayoutWrapper({
    children,
    profileName,
    profileRole
}: {
    children: React.ReactNode;
    profileName: string;
    profileRole: string;
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024; // Changed to 1024 for better tablet support
            setIsMobile(mobile);
            if (!mobile) setIsOpen(true);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const btnColor = profileRole === 'coach' ? 'orange' : 'purple';

    return (
        <div className="flex w-full min-h-screen">
            {/* Hamburger Button - Only mobile */}
            {isMobile && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`fixed top-4 left-4 z-50 p-3 bg-${btnColor}-500 hover:bg-${btnColor}-600 rounded-xl shadow-lg transition-all lg:hidden`}
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            )}

            {/* Overlay - Only mobile when open */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <UniversalSidebar
                role={profileRole}
                profileName={profileName}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                isMobile={isMobile}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                {/* Header */}
                <UniversalHeader currentRole={profileRole} profileRole={profileRole} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
