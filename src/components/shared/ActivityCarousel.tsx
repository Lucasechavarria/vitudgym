"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Activity } from "@/types/activity";

interface ActivityCarouselProps {
    title: string;
    activities: Activity[];
    bgColor?: string; // Clase Tailwind, ej: "bg-white" o "bg-zinc-900"
    textColor?: string; // Clase Tailwind, ej: "text-gray-900"
}

export function ActivityCarousel({
    title,
    activities,
    bgColor = "bg-white",
    textColor = "text-gray-900"
}: ActivityCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Protección contra arrays vacíos
    if (!activities || activities.length === 0) {
        return null;
    }

    const itemsPerPage = 3; // Responsive: deberíamos ajustar esto con window width si fuera necesario, hardcodeado por ahora
    // Nota: Para un carousel simple responsive, usaremos lógica simplificada o CSS grid en móvil.
    // Aquí mantengo la lógica de diapositivas pero forzando 1 en móvil y 3 en desktop en el renderizado.

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev + itemsPerPage >= activities.length ? 0 : prev + 1 // Avanza de a 1 para efecto suave
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? Math.max(0, activities.length - itemsPerPage) : prev - 1
        );
    };

    // Obtenemos slice visible. En caso de loop, podríamos necesitar lógica más compleja.
    // Simplificado: Mostramos ventana deslizante.
    const visibleActivities = activities.slice(currentIndex, currentIndex + itemsPerPage);

    // Si quedan menos items que itemsPerPage al final, rellenamos con el principio (Loop visual básico)
    if (visibleActivities.length < itemsPerPage && activities.length > itemsPerPage) {
        visibleActivities.push(...activities.slice(0, itemsPerPage - visibleActivities.length));
    }

    return (
        <div className={`py-12 ${bgColor}`}>
            <div className="container mx-auto px-4">
                <h2 className={`text-3xl font-bold mb-8 ${textColor} flex items-center gap-2`}>
                    <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
                    {title}
                </h2>

                <div className="relative group">
                    {/* Botones de Navegación */}
                    <button
                        onClick={prevSlide}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 shadow-lg text-gray-800 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 shadow-lg text-gray-800 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Grid de Actividades */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleActivities.map((activity, idx) => (
                            <motion.div
                                key={`${activity.id}-${idx}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative h-48 w-full overflow-hidden">
                                    {activity.imageUrl ? (
                                        <Image
                                            src={activity.imageUrl}
                                            alt={activity.title}
                                            fill
                                            className="object-cover transition-transform duration-500 hover:scale-110"
                                            unoptimized // Importante para URLs externas si no configuramos remotePatterns
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400">Sin Imagen</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                        {activity.type || "General"}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-primary" />
                                            <span>{activity.instructor}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span>{activity.time}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
