'use client';

import { useState, useEffect } from 'react';

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    if (isStandalone) {
        return null; // Don't show if already installed
    }

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    if (!deferredPrompt && !isIOS) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-gray-900 border border-gray-800 rounded-lg shadow-xl md:max-w-md md:left-auto">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-white">Instalar Virtud Gym</h3>
                    <p className="text-sm text-gray-400">
                        {isIOS
                            ? "Para instalar en iOS: toca 'Compartir' y luego 'Agregar a Inicio'"
                            : "Instala la app para una mejor experiencia"}
                    </p>
                </div>
                {!isIOS && (
                    <button
                        onClick={handleInstallClick}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                    >
                        Instalar
                    </button>
                )}
                <button
                    onClick={() => setDeferredPrompt(null)}
                    className="text-gray-400 hover:text-white"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
