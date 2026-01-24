'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Tipos para el formulario (coincide con JSONB de DB)
type EmergencyContact = {
    full_name: string;
    relationship: string;
    phone: string;
    address: string;
};

type MedicalInfo = {
    is_active: boolean; // ¿Realiza actividad física?
    activity_details: string; // ¿Cual?
    is_smoker: boolean;
    weight: string; // Peso
    blood_type: string; // Grupo Sanguíneo
    blood_pressure: string; // Hipertenso Alta/Baja
    injuries: string; // Lesiones
    allergies: string; // Alergias
    chronic_diseases: string; // Enfermedades Crónicas
    pathologies: string; // Patologías
    background: string; // Antecedentes
};

type RegistrationFormData = {
    // Personal
    dni: string;
    gender: "male" | "female" | "other" | "prefer_not_to_say";
    phone: string;
    address: string;
    city: string;
    birth_date: string;

    // Medical (JSONB flattened for form)
    medical: MedicalInfo;

    // Emergency (JSONB flattened for form)
    emergency: EmergencyContact;

    // Legal
    waiver_accepted: boolean;
};

export default function RegistrationForm({ userId, onComplete }: { userId: string, onComplete?: () => void }) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, watch, formState: { errors, isValid }, trigger } = useForm<RegistrationFormData>({
        mode: 'onChange'
    });

    const medicalActive = watch('medical.is_active');

    const nextStep = async () => {
        const result = await trigger(); // Valida todo el formulario, idealmente validar solo campos del step
        if (result) setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const onSubmit = async (data: RegistrationFormData) => {
        if (!data.waiver_accepted) {
            toast.error("Debes aceptar el deslinde de responsabilidad");
            return;
        }

        setIsSubmitting(true);
        try {
            // Preparar datos para JSONB
            const medical_info = data.medical;
            const emergency_contact = data.emergency;

            const { error } = await (supabase
                .from('perfiles') as any)
                .update({
                    dni: data.dni,
                    gender: data.gender,
                    telefono: data.phone, // phone -> telefono
                    direccion: data.address, // address -> direccion
                    ciudad: data.city, // city -> ciudad
                    fecha_nacimiento: data.birth_date, // date_of_birth -> fecha_nacimiento
                    informacion_medica: medical_info, // medical_info -> informacion_medica
                    contacto_emergencia: emergency_contact, // emergency_contact -> contacto_emergencia
                    exencion_aceptada: true, // waiver_accepted -> exencion_aceptada
                    fecha_exencion: new Date().toISOString(), // waiver_date -> fecha_exencion
                    onboarding_completado: true, // onboarding_completed -> onboarding_completado
                    onboarding_completado_en: new Date().toISOString() // onboarding_completed_at -> onboarding_completado_en
                })
                .eq('id', userId);

            if (error) throw error;

            toast.success("Ficha completada exitosamente");
            if (onComplete) {
                onComplete();
            } else {
                router.push('/dashboard');
            }

        } catch (error) {
            console.error('❌ Error saving profile:', error);
            const message = error instanceof Error ? error.message : 'Error desconocido al guardar';
            toast.error("Error al guardar la ficha: " + message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render Steps
    const renderStep1_Personal = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-bold text-white mb-4">Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">D.N.I.</label>
                    <input
                        {...register('dni', { required: 'El DNI es obligatorio' })}
                        type="number" // En UI es numérico
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                        placeholder="Sin puntos"
                    />
                    {errors.dni && <span className="text-red-500 text-xs">{errors.dni.message}</span>}
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Género</label>
                    <select
                        {...register('gender', { required: 'Seleccione una opción' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    >
                        <option value="" className="bg-gray-800">Seleccionar...</option>
                        <option value="male" className="bg-gray-800">Masculino</option>
                        <option value="female" className="bg-gray-800">Femenino</option>
                        <option value="other" className="bg-gray-800">Otro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Fecha de Nacimiento</label>
                    <input
                        {...register('birth_date', { required: 'Fecha requerida' })}
                        type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                    <input
                        {...register('phone', { required: 'Teléfono requerido' })}
                        type="tel"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                        placeholder="+54 9 ..."
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Localidad</label>
                    <input
                        {...register('city', { required: 'Localidad requerida' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Dirección Completa</label>
                    <input
                        {...register('address', { required: 'Dirección requerida' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2_Medical = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-bold text-white mb-4">Ficha Médica</h3>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg">
                <span className="text-white">¿Realiza actividad física?</span>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="true" {...register('medical.is_active')} className="accent-orange-500" /> Si
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="false" {...register('medical.is_active')} className="accent-orange-500" /> No
                    </label>
                </div>
            </div>

            {/* Conditional input handled by checking 'medicalActive' */}
            <AnimatePresence>
                {String(medicalActive) === 'true' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 overflow-hidden"
                    >
                        <label className="block text-sm text-gray-400 mb-1">¿Cual?</label>
                        <input
                            {...register('medical.activity_details', { required: 'Especifique la actividad' })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                            placeholder="Ej: Running, Natación, Crossfit"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Peso (kg)</label>
                    <input
                        {...register('medical.weight')}
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Grupo Sanguíneo</label>
                    <input
                        {...register('medical.blood_type')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Presión Arterial</label>
                    <input
                        {...register('medical.blood_pressure')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                        placeholder="Normal / Alta / Baja"
                    />
                </div>
            </div>

            <div className="mt-4">
                <label className="flex items-center gap-2 bg-white/5 p-3 rounded-lg cursor-pointer max-w-xs">
                    <input type="checkbox" {...register('medical.is_smoker')} className="w-4 h-4 accent-orange-500" />
                    <span className="text-white">¿Fuma?</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Lesiones</label>
                    <textarea
                        {...register('medical.injuries')}
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Alergias</label>
                    <textarea
                        {...register('medical.allergies')}
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Enfermedades Crónicas</label>
                    <textarea
                        {...register('medical.chronic_diseases')}
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Patologías</label>
                    <textarea
                        {...register('medical.pathologies')}
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Antecedentes Médicos</label>
                    <textarea
                        {...register('medical.background')}
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep3_Emergency = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-bold text-white mb-4">Contacto de Emergencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Nombre y Apellido</label>
                    <input
                        {...register('emergency.full_name', { required: 'Requerido' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Parentesco</label>
                    <input
                        {...register('emergency.relationship', { required: 'Requerido' })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                    <input
                        {...register('emergency.phone', { required: 'Requerido' })}
                        type="tel"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Localidad</label>
                    <input
                        {...register('emergency.address')} // Usando address para localidad segun modelo, o crear otro campo. Usamos Address para "Dirección/Localidad"
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                        placeholder="Dirección / Localidad"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep4_Waiver = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-bold text-white mb-4">Deslinde de Responsabilidad</h3>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-sm text-gray-300 space-y-4 leading-relaxed h-64 overflow-y-auto">
                <h4 className="font-bold text-white">Declaración Jurada de Salud</h4>
                <p>
                    A. Yo declaro que soy consciente de que gozo de buena salud y no tengo problemas físicos
                    que pongan en peligro mi integridad o la de otros socios. Teniendo en cuenta esto,
                    acepto entrenar en esta institución ("VIRTUD"), haciéndome responsable ante cualquier tipo de accidente
                    derivado de mi práctica deportiva o condiciones preexistentes no declaradas.
                </p>
                <p>
                    B. Me comprometo a entregar mi Certificado Médico de Aptitud Física dentro de los 20 días como plazo
                    a partir de la fecha de hoy.
                </p>
                <p>
                    C. Entiendo que el gimnasio no se hace responsable por objetos personales que se puedan extraviar
                    o dañar dentro de las instalaciones.
                </p>
            </div>

            <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 bg-orange-900/10 border border-orange-500/20 rounded-lg cursor-pointer hover:bg-orange-900/20 transition-colors">
                    <input
                        type="checkbox"
                        {...register('waiver_accepted', { required: 'Debes aceptar los términos' })}
                        className="mt-1 w-5 h-5 accent-orange-500"
                    />
                    <div className="text-sm">
                        <span className="text-white font-bold block mb-1">Acepto los términos y condiciones</span>
                        <span className="text-gray-400">Marcar esta casilla actúa como mi firma digital y conformidad con lo expresado arriba.</span>
                    </div>
                </label>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar Steps */}
            <div className="w-full md:w-64 bg-zinc-900/50 border-r border-white/5 p-6 flex flex-col">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-orange-500">Ficha Técnica</h2>
                    <p className="text-xs text-gray-500 mt-1">Completa tu perfil para entrenar</p>
                </div>

                <div className="space-y-2 flex-1">
                    {[1, 2, 3, 4].map(num => (
                        <div key={num} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step === num ? 'bg-orange-500/10 border border-orange-500/20' : 'text-gray-500'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === num ? 'bg-orange-500 text-white' : 'bg-gray-800'}`}>
                                {num}
                            </div>
                            <span className={`text-sm ${step === num ? 'text-white font-medium' : ''}`}>
                                {num === 1 && "Personal"}
                                {num === 2 && "Médico"}
                                {num === 3 && "Emergencia"}
                                {num === 4 && "Legal"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-10 flex flex-col">
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                    <div className="flex-1">
                        {step === 1 && renderStep1_Personal()}
                        {step === 2 && renderStep2_Medical()}
                        {step === 3 && renderStep3_Emergency()}
                        {step === 4 && renderStep4_Waiver()}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                        <div className="flex gap-3">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
                                >
                                    Atrás
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
                                >
                                    Siguiente
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!isValid || isSubmitting}
                                    className="px-8 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>Guardando...</>
                                    ) : (
                                        <>Finalizar Ficha</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
