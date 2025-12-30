"use client";

import { useLandingActivities } from "@/hooks/useLandingActivities";
import { ActivityCarousel } from "@/components/ui/ActivityCarousel";
import { InstagramCarousel } from "@/components/ui/InstagramCarousel";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { activities, loading } = useLandingActivities();

  // Filtrado de Actividades
  const gymActivities = activities.filter(a => !a.type || a.type === 'gym');
  const martialArtsActivities = activities.filter(a => a.type === 'martial_arts');
  const tcmActivities = activities.filter(a => a.type === 'tcm');

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* --- HERO SECTION --- */}
      <section className="relative h-[90vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Overlay (Gradient + Noise/Texture opcional) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 z-10" />

        {/* Video o Imagen de Fondo (Placeholder por ahora) */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none">
              DOMINÁ TU <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                POTENCIAL
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 font-medium max-w-3xl mx-auto leading-relaxed">
              Forjá un cuerpo inquebrantable y una mente en equilibrio. <br className="hidden md:block" />
              Gimnasio de élite, Artes Marciales y la sabiduría de la Medicina China.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/signup" className="px-10 py-5 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-500 transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-xl shadow-orange-900/40">
                COMENZAR TRANSFORMACIÓN <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
              </Link>
              <Link href="/login" className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/20 text-white font-black rounded-2xl hover:bg-white/10 transition-all">
                ACCESO MIEMBROS
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SECCIÓN 1: MUNDO FITNESS --- */}
      <ActivityCarousel
        title="ALTOR RENDIMIENTO"
        activities={gymActivities}
        bgColor="bg-zinc-50"
        textColor="text-gray-900"
      />

      {/* --- SECCIÓN 2: ARTES MARCIALES --- */}
      <ActivityCarousel
        title="EL CAMINO DEL GUERRERO"
        activities={martialArtsActivities}
        bgColor="bg-black"
        textColor="text-white"
      />

      {/* --- SECCIÓN 3: SALUD & EQUILIBRIO --- */}
      <ActivityCarousel
        title="CIENCIA Y TRADICIÓN"
        activities={tcmActivities}
        bgColor="bg-orange-50"
        textColor="text-orange-900"
      />

      {/* --- PRICING SECTION --- */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 italic tracking-tight">ELEGÍ TU MODALIDAD</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">Invertí en tu activo más valioso: vos mismo. Sin contratos, sin excusas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {[
              { name: 'DISCIPLINA DÍA', price: '$5.000', features: ['Acceso total a sala de pesas', 'Clase de cortesía (Boxeo/HIIT)', 'Vestuarios premium'], color: 'border-gray-200' },
              { name: 'VIRTUD LIBRE', price: '$25.000', features: ['Gimnasio ilimitado 24/7', 'Clases de combate ilimitadas', 'App con seguimiento de peso', 'Beneficios en Dojo Virtud'], color: 'border-gray-900 bg-gray-900 text-white shadow-3xl scale-110', featured: true },
              { name: 'SISTEMA INTEGRAL', price: '$45.000', features: ['Plan Personalizado por IA', 'Sesión mensual Medicina China', 'Plan de Nutrición IA', 'Acceso a workshops exclusivos'], color: 'border-gray-200' },
            ].map((plan, i) => (
              <div key={i} className={`p-10 rounded-[2.5rem] border-2 flex flex-col transition-all duration-500 hover:translate-y-[-10px] ${plan.color}`}>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-wider">{plan.name}</h3>
                <div className="mb-8">
                  <span className={`text-5xl font-black ${plan.featured ? 'text-orange-500' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`${plan.featured ? 'text-gray-400' : 'text-gray-500'} text-lg`}>/mes</span>
                </div>
                <ul className="space-y-5 mb-10 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-base">
                      <span className="bg-orange-500/10 text-orange-600 p-1 rounded-full text-xs">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${plan.featured ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-xl shadow-orange-900/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  EMPEZAR AHORA
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LOCATION SECTION --- */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-black mb-6">DONDE LA MAGIA <span className="text-orange-500">SUCEDE</span></h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-xl text-orange-600">📍</div>
                  <div>
                    <h4 className="font-bold">Dirección</h4>
                    <p className="text-gray-600">Av. Principal 1234, Buenos Aires, Argentina</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-xl text-orange-600">⏰</div>
                  <div>
                    <h4 className="font-bold">Horarios</h4>
                    <p className="text-gray-600">Lunes a Viernes: 07:00 - 22:00<br />Sábados: 09:00 - 18:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-xl text-orange-600">📞</div>
                  <div>
                    <h4 className="font-bold">Contacto</h4>
                    <p className="text-gray-600">+54 11 1234-5678<br />hola@virtudgym.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full h-[400px] bg-gray-200 rounded-3xl overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
              {/* Simulamos un mapa o imagen del local */}
              <div className="w-full h-full bg-[url('/images/gym-location.webp')] bg-cover bg-center flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center text-white">V</div>
                  <span className="font-bold">Virtud Gym HQ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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