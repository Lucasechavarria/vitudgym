'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase/client';

export default function VisionLabPage() {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState({ used: 0, limit: 5 });
    const [preview, setPreview] = useState<string | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [sharing, setSharing] = useState(false);

    React.useEffect(() => {
        const fetchStudents = async () => {
            const { data } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'member');
            if (data) setStudents(data);
        };
        fetchStudents();
    }, []);

    const handleShare = async () => {
        if (!selectedStudent || !analysis) {
            toast.error('Selecciona un alumno');
            return;
        }

        try {
            setSharing(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            await (supabase.from('messages') as any).insert({
                sender_id: user.id,
                receiver_id: selectedStudent,
                content: `🔍 **Análisis de Técnica (Vision Lab)**\n\n${analysis}`
            });

            toast.success('¡Análisis compartido con el alumno!');
        } catch (error) {
            console.error(error);
            toast.error('Error al compartir');
        } finally {
            setSharing(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
        setAnalysis(null);
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/ai/vision', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setAnalysis(data.analysis);
                setUsage({ used: data.usage, limit: data.limit });
                toast.success('¡Análisis completado!');
            } else if (data.limitReached) {
                toast.error(data.error);
            } else {
                toast.error('Error al analizar el video');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/*': [],
            'image/*': []
        },
        maxFiles: 1,
        maxSize: 20 * 1024 * 1024 // 20MB limit for demo
    });

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">
                            Vision Lab
                        </h1>
                        <span className="text-4xl">👁️</span>
                    </div>
                    <p className="text-gray-400">Analiza la técnica de tus atletas con Inteligencia Artificial.</p>
                </div>

                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Créditos Diarios</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(usage.used / usage.limit) * 100}%` }}
                                className={`h-full ${usage.used >= usage.limit ? 'bg-red-500' : 'bg-green-500'}`}
                            />
                        </div>
                        <span className="text-sm font-bold text-white">{usage.used}/{usage.limit}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div className="space-y-4">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-3xl h-80 flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${isDragActive
                            ? 'border-purple-500 bg-purple-500/10 scale-105'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <input {...getInputProps()} accept="image/*,video/*" capture="environment" />
                        {preview ? (
                            <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                                {preview.includes('video') ? (
                                    <video src={preview} className="w-full h-full object-cover" controls />
                                ) : (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="font-bold">Click para cambiar</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg animate-pulse">
                                    📹
                                </div>
                                <p className="text-xl font-bold text-white">Arrastra tu video aquí</p>
                                <p className="text-sm text-gray-400 mt-2">MP4, MOV o JPG (Max 20MB)</p>
                            </>
                        )}
                    </div>

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 flex items-center gap-3"
                        >
                            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-purple-300 font-medium">Analizando biomecánica... (esto puede tardar unos segundos)</span>
                        </motion.div>
                    )}
                </div>

                {/* Results Area */}
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[500px] relative overflow-hidden">
                    {!analysis && !loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <span className="text-6xl mb-4">🧠</span>
                            <p>El análisis aparecerá aquí</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {analysis && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none"
                            >
                                <ReactMarkdown>{analysis}</ReactMarkdown>

                                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                                    <h4 className="text-white font-bold">Compartir con Alumno</h4>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <select
                                            value={selectedStudent}
                                            onChange={(e) => setSelectedStudent(e.target.value)}
                                            className="flex-1 bg-black/40 text-white border border-white/10 rounded-xl p-3 outline-none focus:border-purple-500 transition-all"
                                        >
                                            <option value="">Seleccionar alumno...</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleShare}
                                            disabled={sharing || !selectedStudent}
                                            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
                                        >
                                            {sharing ? 'Compartiendo...' : '📤 Compartir'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
