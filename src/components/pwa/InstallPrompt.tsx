'use client';

import { useState, useEffect } from 'react';
import { useGym } from '@/components/providers/GymProvider';
import { Download, X, Share2, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPrompt() {
    const { gym } = useGym();
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Mostrar después de unos segundos para no ser intrusivo
            setTimeout(() => setShow(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    if (isStandalone || (!deferredPrompt && !isIOS)) {
        return null;
    }

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShow(false);
        }
    };

    const gymName = gym?.nombre || "Virtud Gym";

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 z-[100] p-6 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-2xl md:max-w-sm md:left-auto md:right-8"
                >
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                    <Download size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-white italic uppercase tracking-tighter text-lg leading-tight">
                                        Instalar {gymName}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                        {isIOS
                                            ? "Ten tu plan de entrenamiento siempre a mano en tu pantalla de inicio."
                                            : "Acceso rápido y modo offline activado para tu gimnasio."}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShow(false)}
                                className="p-2 text-gray-600 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-3 text-xs text-gray-300 font-bold uppercase tracking-widest">
                                    <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px]">1</span>
                                    Toca el botón compartir <Share2 size={14} className="text-blue-500 inline" />
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-300 font-bold uppercase tracking-widest">
                                    <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px]">2</span>
                                    Selecciona "Añadir a Inicio" <PlusSquare size={14} className="text-gray-400 inline" />
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstallClick}
                                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase italic tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                Instalar App
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
