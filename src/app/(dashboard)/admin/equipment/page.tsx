'use client';

import { useState, useEffect } from 'react';
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from '@/actions/gym-equipment';
import toast from 'react-hot-toast';

interface Equipment {
    id: string;
    name: string;
    category: string;
    brand?: string;
    quantity: number;
    is_available: boolean;
    condition: string;
    notes?: string;
}

const CATEGORIES = [
    { value: 'cardio', label: 'Cardio' },
    { value: 'strength', label: 'Fuerza' },
    { value: 'free_weights', label: 'Pesas Libres' },
    { value: 'machines', label: 'Máquinas' },
    { value: 'functional', label: 'Funcional' },
    { value: 'accessories', label: 'Accesorios' },
    { value: 'other', label: 'Otro' },
];

const CONDITIONS = [
    { value: 'excellent', label: 'Excelente', color: 'text-green-400' },
    { value: 'good', label: 'Bueno', color: 'text-blue-400' },
    { value: 'fair', label: 'Regular', color: 'text-yellow-400' },
    { value: 'needs_repair', label: 'Necesita Reparación', color: 'text-red-400' },
];

export default function EquipmentManagementPage() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        category: 'strength',
        brand: '',
        quantity: 1,
        is_available: true,
        condition: 'excellent',
        notes: '',
    });

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        try {
            const data = await getEquipment();
            setEquipment(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar equipamiento');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                await updateEquipment(editingId, formData);
                toast.success('Equipamiento actualizado');
            } else {
                await createEquipment(formData);
                toast.success('Equipamiento creado');
            }

            setShowModal(false);
            resetForm();
            loadEquipment();
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: Equipment) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            category: item.category,
            brand: item.brand || '',
            quantity: item.quantity,
            is_available: item.is_available,
            condition: item.condition,
            notes: item.notes || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este equipamiento?')) return;

        try {
            await deleteEquipment(id);
            toast.success('Equipamiento eliminado');
            loadEquipment();
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Error al eliminar');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: '',
            category: 'strength',
            brand: '',
            quantity: 1,
            is_available: true,
            condition: 'excellent',
            notes: '',
        });
    };

    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getConditionColor = (condition: string) => {
        return CONDITIONS.find(c => c.value === condition)?.color || 'text-gray-400';
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Equipamiento</h1>
                        <p className="text-gray-400">Administra el inventario del gimnasio</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                    >
                        + Agregar Equipamiento
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Buscar equipamiento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Todas las categorías</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEquipment.map(item => (
                        <div key={item.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                                    <span className="text-sm text-gray-400 capitalize">{item.category.replace('_', ' ')}</span>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded ${item.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {item.is_available ? 'Disponible' : 'No disponible'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm mb-4">
                                {item.brand && (
                                    <div className="text-gray-300">
                                        <span className="text-gray-500">Marca:</span> {item.brand}
                                    </div>
                                )}
                                <div className="text-gray-300">
                                    <span className="text-gray-500">Cantidad:</span> {item.quantity}
                                </div>
                                <div className={getConditionColor(item.condition)}>
                                    <span className="text-gray-500">Estado:</span> {CONDITIONS.find(c => c.value === item.condition)?.label}
                                </div>
                                {item.notes && (
                                    <div className="text-gray-400 text-xs italic">{item.notes}</div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredEquipment.length === 0 && (
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <p className="text-gray-400">No se encontró equipamiento</p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {editingId ? 'Editar Equipamiento' : 'Nuevo Equipamiento'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Categoría *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Cantidad *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Marca</label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Estado *</label>
                                    <select
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        {CONDITIONS.map(cond => (
                                            <option key={cond.value} value={cond.value}>{cond.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_available}
                                            onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        Disponible
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
