'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Layout,
    Image as ImageIcon,
    Type,
    Save,
    RefreshCcw,
    Eye,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LandingSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        fetchLandingConfig();
    }, []);

    const fetchLandingConfig = async () => {
        try {
            const res = await fetch('/api/admin/gyms/current');
            const data = await res.json();
            if (res.ok && data.gym) {
                setConfig(data.gym.config_landing || {
                    hero_titulo: "Entrena al Siguiente Nivel",
                    hero_subtitulo: "Descubre una experiencia de entrenamiento única con tecnología de punta.",
                    hero_imagen: "",
                    carrusel_imagenes: [],
                    mostrar_tarifas: true,
                    mostrar_ubicacion: true,
                    secciones: {
                        nosotros: true,
                        actividades: true,
                        contacto: true
                    }
                });
            }
        } catch (error) {
            toast.error('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/gyms/update-landing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config_landing: config })
            });
            if (res.ok) {
                toast.success('¡Landing page actualizada!');
            }
        } catch (error) {
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const addCarouselImage = () => {
        const url = prompt('Introduce la URL de la imagen del carrusel:');
        if (url) {
            setConfig({
                ...config,
                carrusel_imagenes: [...(config.carrusel_imagenes || []), url]
            });
        }
    };

    const removeCarouselImage = (index: number) => {
        const newImages = [...config.carrusel_imagenes];
        newImages.splice(index, 1);
        setConfig({ ...config, carrusel_imagenes: newImages });
    };

    if (loading) return <div className="p-8 text-gray-500 italic">Cargando editor de marketing...</div>;

    return (
        <div className="max-w-5xl space-y-8 p-4 md:p-8 pb-32">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                        🚀 Marketing & Landing Page
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">
                        Configura la cara pública de tu gimnasio. Atráe a nuevos alumnos con una web premium.
                    </p>
                </div>
                <button
                    onClick={() => window.open(`/g/${config?.slug}`, '_blank')}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest"
                >
                    <Eye size={16} /> Ver Pública
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Section */}
                    <div className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <Type size={20} className="text-red-500" />
                            <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Portada (Hero)</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Título de Bienvenida</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-red-500 outline-none transition-all text-sm"
                                    value={config.hero_titulo}
                                    onChange={e => setConfig({ ...config, hero_titulo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Subtítulo Descriptivo</label>
                                <textarea
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-red-500 outline-none transition-all text-sm resize-none"
                                    value={config.hero_subtitulo}
                                    onChange={e => setConfig({ ...config, hero_subtitulo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">URL Imagen de Fondo</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-red-500 outline-none transition-all text-sm"
                                    value={config.hero_imagen}
                                    onChange={e => setConfig({ ...config, hero_imagen: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Carousel Section */}
                    <div className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ImageIcon size={20} className="text-red-500" />
                                <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Carrusel de Fotos</h3>
                            </div>
                            <button
                                onClick={addCarouselImage}
                                className="p-2 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600/20 transition-all"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {config.carrusel_imagenes?.map((img: string, i: number) => (
                                <div key={i} className="relative aspect-video rounded-2xl overflow-hidden group border border-white/10">
                                    <img src={img} alt={`Slide ${i}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeCarouselImage(i)}
                                        className="absolute top-2 right-2 p-2 bg-black/60 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {(!config.carrusel_imagenes || config.carrusel_imagenes.length === 0) && (
                                <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl text-gray-600 text-xs font-black uppercase tracking-widest">
                                    No hay imágenes cargadas en el carrusel
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Configuration */}
                <div className="space-y-8">
                    <div className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <Layout size={20} className="text-red-500" />
                            <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Visibilidad</h3>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => setConfig({ ...config, mostrar_tarifas: !config.mostrar_tarifas })}
                                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                            >
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Mostrar Tarifas</span>
                                {config.mostrar_tarifas ? <ToggleRight className="text-red-500" size={24} /> : <ToggleLeft className="text-gray-600" size={24} />}
                            </button>
                            <button
                                onClick={() => setConfig({ ...config, mostrar_ubicacion: !config.mostrar_ubicacion })}
                                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                            >
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Mostrar Mapa</span>
                                {config.mostrar_ubicacion ? <ToggleRight className="text-red-500" size={24} /> : <ToggleLeft className="text-gray-600" size={24} />}
                            </button>
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Bloques de Contenido</p>
                            {['nosotros', 'actividades', 'contacto'].map((sec) => (
                                <div key={sec} className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={config.secciones[sec]}
                                        onChange={e => setConfig({ ...config, secciones: { ...config.secciones, [sec]: e.target.checked } })}
                                        className="w-4 h-4 rounded bg-white/5 border-white/10 text-red-600 focus:ring-red-600"
                                    />
                                    <span className="text-sm text-gray-300 capitalize">{sec}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-black rounded-[2.5rem] border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 text-amber-500 mb-2">
                            <Save size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Publicar Cambios</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed italic">
                            * Los cambios son instantáneos. Tu landing page es la primera impresión que tienen tus potenciales clientes.
                        </p>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {saving ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                            Guardar Lanzamiento
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
