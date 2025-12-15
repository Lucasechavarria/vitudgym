"use client";

import { useLandingActivities } from "@/hooks/useLandingActivities";
import { ActivityCarousel } from "@/components/ui/ActivityCarousel";
import { InstagramCarousel } from "@/components/ui/InstagramCarousel";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { activities, loading } = useLandingActivities();

  // Filtrado de Actividades
  const gymActivities = activities.filter(a => !a.type || a.type === 'gym');
  const martialArtsActivities = activities.filter(a => a.type === 'martial_arts');
  const tcmActivities = activities.filter(a => a.type === 'tcm');

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* --- HERO SECTION --- */}
      <section className="relative h-[90vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Overlay (Gradient + Noise/Texture opcional) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 z-10" />

        {/* Video o Imagen de Fondo (Placeholder por ahora) */}
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-50 grayscale" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
              ELEVÁ TU <span className="text-orange-500">POTENCIAL</span>
              <br />
              AL SIGUIENTE NIVEL.
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 font-light">
              Entrenamiento Inteligente · Artes Marciales · Medicina China
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/inscripcion" className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                EMPEZAR AHORA <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all">
                SOY MIEMBRO
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SECCIÓN 1: MUNDO FITNESS (Clara) --- */}
      <ActivityCarousel
        title="MUNDO FITNESS"
        activities={gymActivities}
        bgColor="bg-white"
        textColor="text-gray-900"
      />

      {/* --- SECCIÓN 2: ARTES MARCIALES (Oscura) --- */}
      <ActivityCarousel
        title="DOJO VIRTUD"
        activities={martialArtsActivities}
        bgColor="bg-zinc-900"
        textColor="text-white"
      />

      {/* --- SECCIÓN 3: SALUD & EQUILIBRIO (Clara/Zen) --- */}
      <ActivityCarousel
        title="ESPACIO ZEN"
        activities={tcmActivities}
        bgColor="bg-orange-50"
        textColor="text-gray-800"
      />

      {/* --- INSTAGRAM INTEGRATION --- */}
      <InstagramCarousel />

      {/* --- FOOTER SIMPLIFICADO --- */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4 tracking-wider">VIRTUD<span className="text-orange-500">.</span></h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Más que un gimnasio, somos un centro de transformación integral.
            Unite a nuestra comunidad y descubrí de lo que sos capaz.
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <span>© 2025 Virtud Gym</span>
            <Link href="#" className="hover:text-white">Términos</Link>
            <Link href="#" className="hover:text-white">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}