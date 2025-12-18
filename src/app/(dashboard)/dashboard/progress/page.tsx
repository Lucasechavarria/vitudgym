'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ProgressData {
    weight_history: WeightEntry[];
    completed_workouts: number;
    total_workouts: number;
    current_streak: number;
    best_streak: number;
    measurements: Measurement[];
}

interface WeightEntry {
    date: string;
    weight: number;
}

interface Measurement {
    date: string;
    chest: number;
    waist: number;
    hips: number;
    arms: number;
    legs: number;
}

export default function StudentProgressPage() {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [showAddWeight, setShowAddWeight] = useState(false);
    const [newWeight, setNewWeight] = useState('');

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            const response = await fetch('/api/student/progress');
            const data = await response.json();

            if (data.success) {
                setProgress(data.progress);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar progreso');
        } finally {
            setLoading(false);
        }
    };

    const handleAddWeight = async () => {
        if (!newWeight) return;

        try {
            const response = await fetch('/api/student/progress/weight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weight: parseFloat(newWeight) })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Peso registrado');
                setShowAddWeight(false);
                setNewWeight('');
                loadProgress();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al registrar peso');
        }
    };

    const getCompletionPercentage = () => {
        if (!progress || progress.total_workouts === 0) return 0;
        return Math.round((progress.completed_workouts / progress.total_workouts) * 100);
    };

    const getWeightChange = () => {
        if (!progress || progress.weight_history.length < 2) return '0';
        const first = progress.weight_history[0].weight;
        const last = progress.weight_history[progress.weight_history.length - 1].weight;
        return (last - first).toFixed(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Cargando progreso...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">📈 Mi Progreso</h1>
                    <p className="text-gray-400">Seguimiento de tu evolución y logros</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6">
                        <div className="text-orange-100 text-sm mb-1">Entrenamientos Completados</div>
                        <div className="text-3xl font-bold text-white">{progress?.completed_workouts || 0}</div>
                        <div className="text-orange-100 text-xs">de {progress?.total_workouts || 0} totales</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-green-500/30">
                        <div className="text-gray-400 text-sm mb-1">Racha Actual</div>
                        <div className="text-3xl font-bold text-green-400">{progress?.current_streak || 0} días</div>
                        <div className="text-gray-500 text-xs">Mejor: {progress?.best_streak || 0} días</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-blue-500/30">
                        <div className="text-gray-400 text-sm mb-1">Tasa de Completitud</div>
                        <div className="text-3xl font-bold text-blue-400">{getCompletionPercentage()}%</div>
                        <div className="text-gray-500 text-xs">De tus rutinas</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/30">
                        <div className="text-gray-400 text-sm mb-1">Cambio de Peso</div>
                        <div className={`text-3xl font-bold ${parseFloat(getWeightChange()) > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {parseFloat(getWeightChange()) > 0 ? '+' : ''}{getWeightChange()} kg
                        </div>
                        <div className="text-gray-500 text-xs">Desde el inicio</div>
                    </div>
                </div>

                {/* Weight Chart */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Evolución de Peso</h2>
                        <button
                            onClick={() => setShowAddWeight(true)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm"
                        >
                            + Registrar Peso
                        </button>
                    </div>

                    {progress && progress.weight_history.length > 0 ? (
                        <div className="space-y-4">
                            {/* Simple line representation */}
                            <div className="h-64 flex items-end gap-2">
                                {progress.weight_history.map((entry, index) => {
                                    const maxWeight = Math.max(...progress.weight_history.map(e => e.weight));
                                    const minWeight = Math.min(...progress.weight_history.map(e => e.weight));
                                    const range = maxWeight - minWeight || 1;
                                    const height = ((entry.weight - minWeight) / range) * 100;

                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center">
                                            <div className="text-xs text-orange-400 font-bold mb-1">{entry.weight}kg</div>
                                            <div
                                                className="w-full bg-orange-500 rounded-t"
                                                style={{ height: `${Math.max(height, 10)}%` }}
                                            ></div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                {new Date(entry.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">⚖️</div>
                            <div className="text-gray-400 mb-4">No hay registros de peso</div>
                            <button
                                onClick={() => setShowAddWeight(true)}
                                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                            >
                                Registrar Primer Peso
                            </button>
                        </div>
                    )}
                </div>

                {/* Measurements */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-6">Medidas Corporales</h2>

                    {progress && progress.measurements && progress.measurements.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Pecho</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cintura</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cadera</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Brazos</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Piernas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {progress.measurements.map((measurement, index) => (
                                        <tr key={index} className="hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-white">
                                                {new Date(measurement.date).toLocaleDateString('es-AR')}
                                            </td>
                                            <td className="px-4 py-3 text-gray-300">{measurement.chest} cm</td>
                                            <td className="px-4 py-3 text-gray-300">{measurement.waist} cm</td>
                                            <td className="px-4 py-3 text-gray-300">{measurement.hips} cm</td>
                                            <td className="px-4 py-3 text-gray-300">{measurement.arms} cm</td>
                                            <td className="px-4 py-3 text-gray-300">{measurement.legs} cm</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📏</div>
                            <div className="text-gray-400">No hay medidas registradas</div>
                        </div>
                    )}
                </div>

                {/* Add Weight Modal */}
                {showAddWeight && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4">Registrar Peso</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Peso (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                    placeholder="75.5"
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowAddWeight(false);
                                        setNewWeight('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddWeight}
                                    disabled={!newWeight}
                                    className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
                                >
                                    Registrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
