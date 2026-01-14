'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import ProfileViewerModal from '@/components/features/admin/ProfileViewerModal';
import { SupabaseUserProfile } from '@/types/user';

// Extend the shared type to include any frontend-specific fields if needed, 
// or just use it directly. The API returns 'name' as a convenience alias for 'full_name'.
interface User extends SupabaseUserProfile {
    name: string; // API sends this
    membershipStatus: string;
    membershipEnds: string | null;
    items?: any[]; // For older types compatibility if needed
}

interface Coach {
    id: string;
    full_name: string;
    email: string;
}

export default function UsersPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        try {
            const res = await fetch('/api/admin/coaches/list');
            const data = await res.json();
            if (data.coaches) {
                setCoaches(data.coaches);
            }
        } catch (_error) {
            console.error(_error);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('perfiles') // Changed from 'profiles' to 'perfiles'
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(error.message);
            }

            // Assuming 'data' directly contains the user profiles and needs mapping
            // to the 'User' interface, especially for 'name' and membership status.
            // This part might need adjustment based on your 'perfiles' table structure
            // and how 'membershipStatus' and 'membershipEnds' are derived.
            const formattedUsers: User[] = data.map((profile: any) => ({
                ...profile,
                name: profile.full_name || profile.email, // Assuming 'full_name' or 'email' can be used for 'name'
                membershipStatus: profile.is_active ? 'active' : 'inactive', // Example mapping
                membershipEnds: profile.membership_ends_at || null, // Example mapping
            }));
            setUsers(formattedUsers);
        } catch (_error: any) {
            console.error(_error);
            toast.error('Error cargando usuarios: ' + _error.message);
        } finally {
            setLoading(false);
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
            // Cast newRole to specific UserRole via any to avoid complex TS validation here
            setUsers(users.map(u => u.id === uid ? { ...u, role: newRole as any } : u));
        } catch (error: any) {
            toast.error('Error al actualizar rol: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignCoach = async (studentId: string, coachId: string | null) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/users/${studentId}/assign-coach`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coachId: coachId === "" ? null : coachId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success('Coach asignado correctamente');
            setUsers(users.map(u => u.id === studentId ? { ...u, assigned_coach_id: coachId === "" ? undefined : coachId } : u));
        } catch (error: any) {
            toast.error('Error asignando coach: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleActivateMembership = async (userId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days: 30 }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success('Membresía activada correctamente');
            setUsers(users.map(u => u.id === userId ? {
                ...u,
                membershipStatus: 'active',
                membershipEnds: data.newEndDate
            } : u));
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Rol</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Membresía</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Coach Asignado</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3a3a3c]">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            className="bg-[#1c1c1e] border border-[#3a3a3c] rounded px-3 py-1.5 text-xs text-gray-300 focus:border-purple-500 outline-none hover:bg-[#2c2c2e] transition-colors"
                                            value={user.role}
                                            onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="member">Miembro</option>
                                            <option value="coach">Profesor</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">SuperAdmin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        {['admin', 'superadmin', 'coach'].includes(user.role) ? (
                                            <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                🛡️ Staff
                                            </span>
                                        ) : (
                                            <div className="space-y-1">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${user.membershipStatus === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                    'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}>
                                                    {user.membershipStatus === 'active' ? '✓ Activo' : '✗ Inactivo'}
                                                </span>
                                                {user.membershipEnds && (
                                                    <div className="text-[9px] text-gray-500 font-mono">
                                                        Vence: {new Date(user.membershipEnds).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === 'member' ? (
                                            <select
                                                className="bg-[#1c1c1e] border border-[#3a3a3c] rounded px-3 py-1.5 text-xs text-gray-400 focus:border-purple-500 outline-none hover:bg-[#2c2c2e] transition-colors max-w-[150px]"
                                                value={user.assigned_coach_id || ""}
                                                onChange={(e) => handleAssignCoach(user.id, e.target.value)}
                                                disabled={loading}
                                            >
                                                <option value="">Sin Asignar</option>
                                                {coaches.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.full_name || 'Coach'}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-[10px] text-gray-600 italic">No aplica</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                                className="px-3 py-1.5 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white rounded-lg text-xs font-bold border border-purple-600/30 transition-all"
                                                title="Ver Ficha"
                                            >
                                                📄
                                            </button>

                                            {/* Solo mostrar renovación para miembros */}
                                            {!['admin', 'superadmin', 'coach'].includes(user.role) && (
                                                <button
                                                    onClick={() => handleActivateMembership(user.id)}
                                                    className="px-3 py-1.5 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg text-xs font-bold border border-green-600/30 transition-all"
                                                    title="Renovar Membresía"
                                                >
                                                    💳
                                                </button>
                                            )}
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

            <ProfileViewerModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
                user={selectedUser}
            />
        </div >
    );
}
