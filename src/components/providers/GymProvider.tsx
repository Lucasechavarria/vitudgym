"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface GymContextType {
    gym: {
        id: string;
        nombre: string;
        slug: string;
        color_primario: string;
        logo_url: string | null;
        modulos: Record<string, boolean>;
        config_visual: Record<string, unknown>;
    } | null;
    isLoading: boolean;
    hasModule: (moduleName: string) => boolean;
}

const DEFAULT_COLOR = "#6d28d9"; // violeta por defecto

const GymContext = createContext<GymContextType>({
    gym: null,
    isLoading: true,
    hasModule: () => true, // Por defecto mostrar todo mientras carga
});

export const useGym = () => useContext(GymContext);

export const GymProvider = ({ children }: { children: React.ReactNode }) => {
    const [gym, setGym] = useState<GymContextType["gym"]>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGymData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                // 1. Obtener el gimnasio_id del perfil del usuario
                const { data: profile } = await supabase
                    .from("perfiles")
                    .select("gimnasio_id")
                    .eq("id", user.id)
                    .single();

                if (!profile?.gimnasio_id) {
                    setIsLoading(false);
                    return;
                }

                // 2. Obtener datos del gimnasio usando las columnas reales de la DB
                const { data: gymData } = await supabase
                    .from("gimnasios")
                    .select("id, nombre, slug, logo_url, color_primario, config_visual, modulos_activos, es_activo")
                    .eq("id", profile.gimnasio_id)
                    .single();

                if (gymData) {
                    const color = gymData.color_primario || DEFAULT_COLOR;

                    setGym({
                        id: gymData.id,
                        nombre: gymData.nombre,
                        slug: gymData.slug,
                        color_primario: color,
                        logo_url: gymData.logo_url || null,
                        modulos: (gymData.modulos_activos as Record<string, boolean>) || {
                            rutinas_ia: true,
                            gamificacion: true,
                            nutricion_ia: true,
                            pagos_online: true,
                            clases_reserva: true,
                        },
                        config_visual: (gymData.config_visual as Record<string, unknown>) || {},
                    });

                    // 3. Inyectar el color primario en CSS variables globales
                    document.documentElement.style.setProperty("--primary", color);
                    document.documentElement.style.setProperty("--primary-foreground", "#ffffff");
                }
            } catch (error) {
                console.error("[GymProvider] Error loading gym context:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGymData();
    }, []);

    const hasModule = (moduleName: string): boolean => {
        // Si aún está cargando, permitir acceso para no bloquear la UI
        if (isLoading) return true;
        // Si no hay gym configurado, permitir todo (superadmin sin gym o gym sin módulos)
        if (!gym) return true;
        return !!gym.modulos?.[moduleName];
    };

    return (
        <GymContext.Provider value={{ gym, isLoading, hasModule }}>
            {children}
        </GymContext.Provider>
    );
};
