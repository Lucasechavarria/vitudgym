'use client';

import React, { useEffect, useState } from 'react';

interface PrivacyShieldProps {
    children: React.ReactNode;
    userId?: string;
    userName?: string;
}

const PrivacyShield: React.FC<PrivacyShieldProps> = ({ children, userId = 'ANON', userName = 'Usuario' }) => {
    const [isBlurred, setIsBlurred] = useState(false);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true);
            } else {
                setIsBlurred(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Intentar bloquear atajos comunes de captura (no siempre funciona en web, pero disuade)
            if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || (e.metaKey && e.shiftKey && e.key === '4')) {
                setIsBlurred(true);
                setTimeout(() => setIsBlurred(false), 2000);
                // alert('Capturas deshabilitadas por privacidad.');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div
            className="relative w-full h-full select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
            {/* Marca de agua repetida */}
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden opacity-5 flex flex-wrap content-between justify-around gap-10 p-10 select-none">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="transform -rotate-45 text-xl font-bold text-gray-500 whitespace-nowrap">
                        {userName} - {userId.slice(0, 5)}...
                    </div>
                ))}
            </div>

            {/* Capa de desenfoque */}
            {isBlurred && (
                <div className="absolute inset-0 z-[60] bg-gray-900/95 backdrop-blur-3xl flex items-center justify-center p-4 text-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Contenido Protegido</h2>
                        <p className="text-gray-300">Por privacidad, el contenido se oculta si cambias de ventana o intentas capturar.</p>
                    </div>
                </div>
            )}

            {children}
        </div>
    );
};

export default PrivacyShield;
