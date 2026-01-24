'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface NutritionPlan {
    id: string;
    usuario_id: string;
    calorias_diarias: number;
    gramos_proteina: number;
    gramos_carbohidratos: number;
    gramos_grasas: number;
    comidas: Meal[];
    notas: string;
    creado_en: string;
}

interface Meal {
    nombre: string;
    horario: string;
    alimentos: Food[];
    calorias: number;
    proteina: number;
    carbohidratos: number;
    grasas: number;
}

interface Food {
    nombre: string;
    cantidad: string;
    calorias: number;
    proteina: number;
    carbohidratos: number;
    grasas: number;
}

export default function StudentNutritionPage() {
    const [loading, setLoading] = useState(true);
    const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
    const [selectedMeal, setSelectedMeal] = useState<number>(0);

    useEffect(() => {
        loadNutritionPlan();
    }, []);

    const loadNutritionPlan = async () => {
        try {
            const response = await fetch('/api/student/nutrition');
            const data = await response.json();

            if (data.success && data.plan) {
                setNutritionPlan(data.plan);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar plan nutricional');
        } finally {
            setLoading(false);
        }
    };

    const getMacroPercentage = (grams: number, totalCalories: number, caloriesPerGram: number) => {
        return ((grams * caloriesPerGram) / totalCalories * 100).toFixed(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-white">Cargando plan nutricional...</div>
            </div>
        );
    }

    if (!nutritionPlan) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-[#1c1c1e] rounded-lg p-12 text-center border border-white/10">
                        <div className="text-6xl mb-4">🍎</div>
                        <h2 className="text-2xl font-bold text-white mb-4">No tienes un plan nutricional asignado</h2>
                        <p className="text-gray-400 mb-6">
                            Tu coach aún no ha creado un plan nutricional para ti. Contacta con tu coach para obtener uno personalizado.
                        </p>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const proteinPercentage = getMacroPercentage(nutritionPlan.gramos_proteina, nutritionPlan.calorias_diarias, 4);
    const carbsPercentage = getMacroPercentage(nutritionPlan.gramos_carbohidratos, nutritionPlan.calorias_diarias, 4);
    const fatsPercentage = getMacroPercentage(nutritionPlan.gramos_grasas, nutritionPlan.calorias_diarias, 9);

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6 text-white">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">🍎 Mi Plan Nutricional</h1>
                    <p className="text-gray-400">Plan personalizado según tus objetivos</p>
                </div>

                {/* Macros Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6">
                        <div className="text-orange-100 text-sm mb-1">Calorías Diarias</div>
                        <div className="text-3xl font-bold text-white">{nutritionPlan.calorias_diarias}</div>
                        <div className="text-orange-100 text-xs">kcal/día</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-blue-500/30">
                        <div className="text-gray-400 text-sm mb-1">Proteínas</div>
                        <div className="text-3xl font-bold text-blue-400">{nutritionPlan.gramos_proteina}g</div>
                        <div className="text-gray-500 text-xs">{proteinPercentage}% del total</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-green-500/30">
                        <div className="text-gray-400 text-sm mb-1">Carbohidratos</div>
                        <div className="text-3xl font-bold text-green-400">{nutritionPlan.gramos_carbohidratos}g</div>
                        <div className="text-gray-500 text-xs">{carbsPercentage}% del total</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/30">
                        <div className="text-gray-400 text-sm mb-1">Grasas</div>
                        <div className="text-3xl font-bold text-yellow-400">{nutritionPlan.gramos_grasas}g</div>
                        <div className="text-gray-500 text-xs">{fatsPercentage}% del total</div>
                    </div>
                </div>

                {/* Macro Distribution Chart */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Distribución de Macronutrientes</h2>
                    <div className="flex gap-2 h-8 rounded-lg overflow-hidden">
                        <div
                            className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                            style={{ width: `${proteinPercentage}%` }}
                        >
                            {parseFloat(proteinPercentage) > 15 && `${proteinPercentage}%`}
                        </div>
                        <div
                            className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
                            style={{ width: `${carbsPercentage}%` }}
                        >
                            {parseFloat(carbsPercentage) > 15 && `${carbsPercentage}%`}
                        </div>
                        <div
                            className="bg-yellow-500 flex items-center justify-center text-white text-sm font-semibold"
                            style={{ width: `${fatsPercentage}%` }}
                        >
                            {parseFloat(fatsPercentage) > 15 && `${fatsPercentage}%`}
                        </div>
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span className="text-gray-400">Proteínas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-gray-400">Carbohidratos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span className="text-gray-400">Grasas</span>
                        </div>
                    </div>
                </div>

                {/* Meals */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    {/* Meal Tabs */}
                    <div className="flex overflow-x-auto bg-gray-700 p-2 gap-2">
                        {nutritionPlan.comidas.map((meal, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedMeal(index)}
                                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${selectedMeal === index
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    }`}
                            >
                                {meal.nombre}
                                <span className="ml-2 text-xs opacity-75">{meal.horario}</span>
                            </button>
                        ))}
                    </div>

                    {/* Meal Details */}
                    <div className="p-6">
                        {nutritionPlan.comidas[selectedMeal] && (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{nutritionPlan.comidas[selectedMeal].nombre}</h3>
                                        <p className="text-gray-400">🕐 {nutritionPlan.comidas[selectedMeal].horario}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-orange-500">{nutritionPlan.comidas[selectedMeal].calorias}</div>
                                        <div className="text-gray-400 text-sm">kcal</div>
                                    </div>
                                </div>

                                {/* Meal Macros */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                                        <div className="text-blue-400 font-bold text-xl">{nutritionPlan.comidas[selectedMeal].proteina}g</div>
                                        <div className="text-gray-400 text-sm">Proteínas</div>
                                    </div>
                                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                                        <div className="text-green-400 font-bold text-xl">{nutritionPlan.comidas[selectedMeal].carbohidratos}g</div>
                                        <div className="text-gray-400 text-sm">Carbohidratos</div>
                                    </div>
                                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                                        <div className="text-yellow-400 font-bold text-xl">{nutritionPlan.comidas[selectedMeal].grasas}g</div>
                                        <div className="text-gray-400 text-sm">Grasas</div>
                                    </div>
                                </div>

                                {/* Foods List */}
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-4">Alimentos</h4>
                                    <div className="space-y-3">
                                        {nutritionPlan.comidas[selectedMeal].alimentos.map((food, foodIndex) => (
                                            <div key={foodIndex} className="bg-gray-700 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-semibold text-white">{food.nombre}</div>
                                                    <div className="text-orange-400 font-bold">{food.calorias} kcal</div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span>📦 {food.cantidad}</span>
                                                    <span className="text-blue-400">P: {food.proteina}g</span>
                                                    <span className="text-green-400">C: {food.carbohidratos}g</span>
                                                    <span className="text-yellow-400">G: {food.grasas}g</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <p className="text-gray-400 text-sm text-center">
                        <span className="text-orange-400 font-bold">⚠️ Aviso Legal:</span> Esta es una guía de alimentación sugerida por IA para orientarte. Recordá que no reemplaza a un profesional: siempre consultá con un nutricionista para un plan a tu medida.
                    </p>
                </div>
            </div>
        </div>
    );
}
