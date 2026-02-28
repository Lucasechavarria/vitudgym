"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface VisualConfig {
    color_primario: string;
    logo_url: string | null;
    tema: "dark" | "light";
}

interface GymContextType {
    gym: {
        id: string;
        nombre: string;
        slug: string;
        configuracion: VisualConfig;
        modulos: Record<string, boolean>;
    } | null;
    isLoading: boolean;
    hasModule: (moduleName: string) => boolean;
}

const GymContext = createContext<GymContextType>({
    gym: null,
    isLoading: true,
    hasModule: () => false,
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

                // Obtener el gimnasio_id del perfil del usuario
                const { data: profile } = await supabase
                    .from("perfiles")
                    .select("gimnasio_id")
                    .eq("id", user.id)
                    .single();

                if (profile?.gimnasio_id) {
                    // Obtener los datos del gimnasio
                    const { data: gymData } = await supabase
                        .from("gimnasios")
                        .select("*")
                        .eq("id", profile.gimnasio_id)
                        .single();

                    if (gymData) {
                        setGym({
                            id: gymData.id,
                            nombre: gymData.nombre,
                            slug: gymData.slug,
                            configuracion: (gymData.configuracion as unknown as VisualConfig) || {
                                color_primario: "#00ff00",
                                logo_url: null,
                                tema: "dark",
                            },
                            modulos: gymData.modulos_activos || {},
                        });

                        // Aplicar el color primario dinámicamente al root de CSS
                        const primaryColor = (gymData.configuracion as any)?.color_primario || "#00ff00";
                        document.documentElement.style.setProperty("--primary", hexToOklch(primaryColor));
                    }
                }
            } catch (error) {
                console.error("Error loading gym context:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGymData();
    }, []);

    const hasModule = (moduleName: string) => {
        return !!gym?.modulos?.[moduleName];
    };

    return (
        <GymContext.Provider value={{ gym, isLoading, hasModule }}>
            {children}
        </GymContext.Provider>
    );
};

/**
 * Utility to convert Hex to OKLCH format (simple approximation)
 * Shadcn v4 / Tailwind v4 uses OKLCH by default.
 */
function hexToOklch(hex: string): string {
    // Por ahora devolvemos el hex directamente si el navegador lo soporta en variables,
    // pero para Tailwind v4 OKLCH es mejor. 
    // Una aproximación simple para no complicar el script en este paso.
    // Si prefieres usar HEX plano, Tailwind v4 también lo acepta si se define correctamente.
    return hex;
}
