'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Palette,
    Image as ImageIcon,
    Layers,
    Save,
    RefreshCcw,
    Layout
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrandingSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        nombre: '',
        color_primario: '#ef4444',
        color_secundario: '#000000',
        logo_url: '',
        config_visual: {
            dark_mode: true,
            border_radius: '1rem'
        }
    });

    useEffect(() => {
        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        try {
            const res = await fetch('/api/admin/gyms/current');
            const data = await res.json();
            if (res.ok && data.gym) {
                setConfig({
                    nombre: data.gym.nombre,
                    color_primario: data.gym.color_primario || '#ef4444',
                    color_secundario: data.gym.color_secundario || '#000000',
                    logo_url: data.gym.logo_url || '',
                    config_visual: data.gym.config_visual || { dark_mode: true, border_radius: '1rem' }
                });
            }
        } catch (error) {
            console.error('Error fetching branding:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/gyms/update-branding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                toast.success('¡Identidad visual actualizada!');
                window.location.reload(); // Reload to apply CSS variables if implemented
            } else {
                toast.error('Error al guardar cambios');
            }
        } catch (error) {
            toast.error('Error de red');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-8 p-4 md:p-8">
            <div>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                    🎨 Identidad de Marca
                </h1>
                <p className="text-gray-400 mt-2 font-medium">
                    Personaliza cómo tus alumnos ven la aplicación.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Branding Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Colors & Logo */}
                    <div className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Palette size={20} className="text-red-500" />
                            <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Colores Institucionales</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Color Primario</span>
                                <input
                                    type="color"
                                    className="w-12 h-12 bg-transparent cursor-pointer rounded-lg overflow-hidden border-none"
                                    value={config.color_primario}
                                    onChange={e => setConfig({ ...config, color_primario: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Color Secundario</span>
                                <input
                                    type="color"
                                    className="w-12 h-12 bg-transparent cursor-pointer rounded-lg overflow-hidden border-none"
                                    value={config.color_secundario}
                                    onChange={e => setConfig({ ...config, color_secundario: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">URL del Logo (Square PNG)</label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-red-500 outline-none transition-all text-sm"
                                    value={config.logo_url}
                                    onChange={e => setConfig({ ...config, logo_url: e.target.value })}
                                />
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <ImageIcon size={20} className="text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Live */}
                    <div className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 p-8 flex flex-col justify-center items-center text-center space-y-6">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 text-center w-full">Vista Previa Real-Time</div>

                        <div className="w-48 h-20 rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl flex items-center justify-center p-4 bg-black">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundColor: config.color_primario }} />
                            {config.logo_url ? (
                                <img src={config.logo_url} alt="Logo Preview" className="h-full object-contain relative z-10" />
                            ) : (
                                <h4 className="text-white font-black italic relative z-10">{config.nombre || 'TU GIMNASIO'}</h4>
                            )}
                        </div>

                        <div className="space-y-4 w-full">
                            <button
                                type="button"
                                className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
                                style={{ backgroundColor: config.color_primario, color: '#fff' }}
                            >
                                Botón de Ejemplo
                            </button>
                            <p className="text-[10px] text-gray-500 font-medium">
                                Así se verán tus botones y acentos de color.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visual Config */}
                <div className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Layout size={20} className="text-red-500" />
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Preferencias de Layout</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Esquinas (Radius)</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-red-500 outline-none"
                                value={config.config_visual.border_radius}
                                onChange={e => setConfig({ ...config, config_visual: { ...config.config_visual, border_radius: e.target.value } })}
                            >
                                <option value="0">Rectas (Square)</option>
                                <option value="0.5rem">Suaves (Round)</option>
                                <option value="1rem">Modernas (Pill)</option>
                                <option value="2rem">Extra Redondeadas</option>
                            </select>
                        </div>

                        {/* Placeholder for more */}
                        <div className="p-4 bg-white/5 rounded-3xl border border-dashed border-white/10 flex items-center justify-center text-center">
                            <p className="text-[10px] font-bold text-gray-600 uppercase italic">Más opciones en desarrollo</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-3xl border border-dashed border-white/10 flex items-center justify-center text-center">
                            <p className="text-[10px] font-bold text-gray-600 uppercase italic">Control de Tipografía v3</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center p-8 bg-black rounded-[2.5rem] border border-white/5">
                    <p className="text-xs text-gray-500 italic max-w-sm">
                        * Los cambios de marca pueden tardar unos minutos en propagarse a todos los dispositivos de tus alumnos.
                    </p>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
                    >
                        {saving ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                        Guardar Identidad
                    </button>
                </div>
            </form>
        </div>
    );
}
