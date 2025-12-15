'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    membershipStatus: string;
    membershipEnds: string | null;
}

export default function UsersPage() {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users/list');
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error cargando usuarios');
        }
    };

    const handleRoleUpdate = async (uid: string, newRole: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/set-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, role: newRole }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success(`Rol actualizado a ${newRole}`);
            setUsers(users.map(u => u.id === uid ? { ...u, role: newRole } : u));
        } catch (error: any) {
            toast.error('Error al actualizar rol: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleActivateMembership = async (uid: string) => {
        if (!confirm('¿Activar membresía por 30 días para este usuario?')) return;

        setLoading(true);
        try {
            // Usar el endpoint de activacion manual creado
            const response = await fetch(`/api/admin/users/${uid}/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days: 30 }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success('Membresía activada exitosamente');
            // Refresh list
            fetchUsers();
        } catch (error: any) {
            toast.error('Error activando membresía: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">
                        👥 Gestión de Usuarios
                    </h1>
                    <p className="text-gray-400 mt-1">{users.length} usuarios totales</p>
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-[#1c1c1e] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 bg-[#1c1c1e] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                        <option value="all">Todos los roles</option>
                        <option value="user">Usuarios</option>
                        <option value="coach">Profesores</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            <div className="bg-[#2c2c2e] rounded-2xl border border-[#3a3a3c] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1c1c1e] text-gray-400 text-sm uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-medium">Usuario</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Rol</th>
                                <th className="p-4 font-medium">Membresía</th>
                                <th className="p-4 font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3a3a3c]">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-medium text-white">{user.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">{user.email}</td>
                                    <td className="p-4">
                                        <select
                                            className="bg-[#1c1c1e] border border-[#3a3a3c] rounded px-3 py-1.5 text-sm text-gray-300 focus:border-purple-500 outline-none hover:bg-[#2c2c2e] transition-colors"
                                            value={user.role}
                                            onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="user">Usuario</option>
                                            <option value="coach">Profesor</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">SuperAdmin</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase
                                            ${user.membershipStatus === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}
                                        `}>
                                            {user.membershipStatus === 'active' ? '✓ Activo' : '✗ Inactivo'}
                                        </span>
                                        {user.membershipEnds && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Vence: {new Date(user.membershipEnds).toLocaleDateString('es-AR')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleActivateMembership(user.id)}
                                                className="px-3 py-1.5 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg text-xs font-medium border border-green-600/30 transition-all"
                                                title="Activar manualmente por 30 días"
                                            >
                                                ✓ Activar
                                            </button>
                                            <button
                                                onClick={() => toast.loading('Funcionalidad en desarrollo')}
                                                className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-medium border border-blue-600/30 transition-all"
                                                title="Editar perfil"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('¿Estás seguro de eliminar este usuario?')) {
                                                        toast.error('Funcionalidad en desarrollo');
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-xs font-medium border border-red-600/30 transition-all"
                                                title="Eliminar usuario"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="text-gray-500">
                                            <p className="text-4xl mb-2">🔍</p>
                                            <p>No se encontraron usuarios con esos criterios.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
