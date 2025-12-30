'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';


interface SecureRoutineViewerProps {
    routineId: string;
    userId: string;
    children: ReactNode;
}

/**
 * Componente seguro para visualizar rutinas (Desktop + Mobile)
 * 
 * Protecciones Desktop:
 * - Detecta intentos de captura de pantalla
 * - Detecta apertura de DevTools
 * - Watermark dinámico con ID de usuario
 * - Deshabilita selección de texto y menú contextual
 * 
 * Protecciones Mobile:
 * - Watermarks ultra-densos (30+)
 * - Detecta comportamientos sospechosos
 * - Detecta cambios de orientación
 * - Detecta long-press (Android screenshot)
 * - Análisis de patrones de uso
 */
export function SecureRoutineViewer({ routineId, userId, children }: SecureRoutineViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isBlurred, setIsBlurred] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const pageLoadTime = useRef(Date.now());
    const viewCount = useRef(0);

    useEffect(() => {
        // Detectar si es móvil
        const checkMobile = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(mobile);
            return mobile;
        };

        const isMobileDevice = checkMobile();

        // 1. Detectar cambio de visibilidad (usuario cambia de pestaña o app)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                const timeOnPage = Date.now() - pageLoadTime.current;

                // Comportamiento sospechoso: salió muy rápido (posible screenshot)
                if (timeOnPage < 2000 && viewCount.current < 3) {
                    logAccess('suspicious_quick_exit', {
                        timeOnPage,
                        viewCount: viewCount.current,
                        isMobile: isMobileDevice
                    });
                }

                setIsBlurred(true);
                logAccess('view_interrupted');
            } else {
                setIsBlurred(false);
                viewCount.current++;
            }
        };

        // 2. Detectar intento de captura de pantalla (teclas - Desktop)
        const handleKeyDown = (e: KeyboardEvent) => {
            // Windows: PrintScreen, Alt+PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                logAccess('screenshot_attempt');
                showSecurityWarning('Las capturas de pantalla están deshabilitadas para proteger tu información médica.');
            }

            // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
            if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
                e.preventDefault();
                logAccess('screenshot_attempt');
                showSecurityWarning('Las capturas de pantalla están deshabilitadas para proteger tu información médica.');
            }

            // Ctrl+P (imprimir)
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                logAccess('download_attempt');
                showSecurityWarning('La impresión está deshabilitada. Consulta con tu coach si necesitas una copia.');
            }

            // Ctrl+S (guardar)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                logAccess('download_attempt');
                showSecurityWarning('No puedes guardar esta página. Tu rutina está siempre disponible en la app.');
            }
        };

        // 3. Detectar DevTools (intento de inspeccionar)
        let devToolsOpen = false;
        const detectDevTools = () => {
            const threshold = 160;
            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;

            if (widthDiff > threshold || heightDiff > threshold) {
                if (!devToolsOpen) {
                    devToolsOpen = true;
                    setIsBlurred(true);
                    logAccess('devtools_detected');
                    showSecurityWarning('Las herramientas de desarrollador están deshabilitadas por seguridad.');
                }
            } else {
                if (devToolsOpen) {
                    devToolsOpen = false;
                    setIsBlurred(false);
                }
            }
        };

        // 4. Deshabilitar menú contextual (click derecho)
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            showSecurityWarning('El menú contextual está deshabilitado por seguridad.');
        };

        // 5. Detectar intento de compartir
        const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
            // No mostramos mensaje, solo registramos
            logAccess('view_interrupted');
        };

        // 6. Detectar cambios de orientación (Mobile - posible screenshot)
        const handleOrientationChange = () => {
            if (isMobileDevice) {
                logAccess('orientation_change', {
                    orientation: screen.orientation?.type || 'unknown',
                    angle: (window.orientation !== undefined) ? window.orientation : screen.orientation?.angle
                });
            }
        };

        // 7. Detectar long-press (Android screenshot gesture)
        let longPressTimer: ReturnType<typeof setTimeout>;
        const handleTouchStart = (e: TouchEvent) => {
            if (isMobileDevice) {
                longPressTimer = setTimeout(() => {
                    logAccess('suspicious_long_press', {
                        touches: e.touches.length,
                        target: (e.target as HTMLElement).tagName
                    });
                }, 500);
            }
        };

        const handleTouchEnd = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
            }
        };

        // 8. Detectar vistas repetidas (comportamiento sospechoso)
        const checkRepeatedViews = () => {
            if (viewCount.current > 10) {
                const timeOnPage = Date.now() - pageLoadTime.current;
                if (timeOnPage < 300000) { // 5 minutos
                    logAccess('suspicious_repeated_views', {
                        viewCount: viewCount.current,
                        timeOnPage
                    });
                }
            }
        };

        // 9. Watermark dinámico (más denso en móvil)
        const addWatermark = () => {
            if (containerRef.current) {
                const watermarkCount = isMobileDevice ? 30 : 20;

                // Crear múltiples watermarks para cubrir toda la pantalla
                const watermarkContainer = document.createElement('div');
                watermarkContainer.className = 'secure-watermark-container';
                watermarkContainer.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    user-select: none;
                    z-index: 9998;
                    overflow: hidden;
                `;

                // Crear patrón de watermarks
                for (let i = 0; i < watermarkCount; i++) {
                    const watermark = document.createElement('div');
                    const rotation = -45 + (Math.random() * 20 - 10);
                    const opacity = isMobileDevice ? 0.08 : 0.08;
                    const fontSize = isMobileDevice ? 18 : 24;

                    watermark.style.cssText = `
                        position: absolute;
                        top: ${Math.random() * 100}%;
                        left: ${Math.random() * 100}%;
                        transform: translate(-50%, -50%) rotate(${rotation}deg);
                        font-size: ${fontSize}px;
                        color: rgba(255, 100, 0, ${opacity});
                        font-weight: bold;
                        white-space: nowrap;
                        pointer-events: none;
                        user-select: none;
                    `;

                    const timestamp = new Date().toISOString().split('T')[0];
                    watermark.textContent = `CONFIDENCIAL - ${userId.substring(0, 8)} - ${timestamp}`;
                    watermarkContainer.appendChild(watermark);
                }

                containerRef.current.appendChild(watermarkContainer);
            }
        };

        // Registrar event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Mobile-specific listeners
        let repeatedViewsInterval: ReturnType<typeof setInterval> | undefined;
        if (isMobileDevice) {
            window.addEventListener('orientationchange', handleOrientationChange);
            document.addEventListener('touchstart', handleTouchStart as any);
            document.addEventListener('touchend', handleTouchEnd);

            // Check repeated views every 30 seconds
            repeatedViewsInterval = setInterval(checkRepeatedViews, 30000);
        }

        const devToolsInterval = setInterval(detectDevTools, 1000);

        addWatermark();

        // Log de acceso inicial
        logAccess('view');

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            clearInterval(devToolsInterval);

            // Mobile cleanup
            if (isMobileDevice) {
                window.removeEventListener('orientationchange', handleOrientationChange);
                document.removeEventListener('touchstart', handleTouchStart as any);
                document.removeEventListener('touchend', handleTouchEnd);
                if (repeatedViewsInterval) clearInterval(repeatedViewsInterval);
            }
        };
    }, [routineId, userId]);

    const logAccess = async (action: string, extraData?: Record<string, unknown>) => {
        try {
            await fetch('/api/routines/log-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    routineId,
                    userId,
                    action,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    isMobile,
                    ...extraData
                })
            });
        } catch (error) {
            console.error('Failed to log access:', error);
        }
    };

    const showSecurityWarning = (message: string) => {
        setWarningMessage(message);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
    };

    return (
        <div
            ref={containerRef}
            className={`relative secure-content ${isBlurred ? 'blur-lg' : ''}`}
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                position: 'relative',
            }}
        >
            {/* Contenido de la rutina */}
            {children}

            {/* Overlay de bloqueo */}
            {isBlurred && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
                    <div className="text-center p-8 bg-gray-900/90 rounded-lg border-2 border-orange-500">
                        <div className="text-6xl mb-4">🔒</div>
                        <p className="text-white text-xl font-bold mb-2">
                            Vista Bloqueada por Seguridad
                        </p>
                        <p className="text-gray-300 text-sm">
                            Cierra las herramientas de desarrollador para continuar
                        </p>
                    </div>
                </div>
            )}

            {/* Warning toast */}
            {showWarning && (
                <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
                    <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md">
                        <div className="text-2xl">⚠️</div>
                        <div>
                            <p className="font-bold text-sm">Acción No Permitida</p>
                            <p className="text-xs opacity-90">{warningMessage}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
