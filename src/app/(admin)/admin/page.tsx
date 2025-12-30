import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch real data
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, role, membership_status')
        .in('role', ['member', 'student', 'user']);

    const activeMembers = profiles?.filter(p => p.membership_status === 'active').length || 0;
    const totalUsers = profiles?.filter(p => p.role !== 'admin' && p.role !== 'superadmin').length || 0;

    // Fetch Classes for Today
    const today = new Date().getDay(); // 0 (Sun) to 6 (Sat)
    const { count: classesToday } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('day_of_week', today)
        .eq('is_active', true);

    // Fetch Expiring Memberships
    const { data: expiringMemberships } = await supabase
        .from('profiles')
        .select('full_name, membership_end_date')
        .eq('membership_status', 'active')
        .lte('membership_end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('membership_end_date', { ascending: true })
        .limit(5);


    const stats = [
        { title: 'Socios Activos', value: activeMembers.toString(), trend: '+12%', icon: '👥' },
        { title: 'Total Usuarios', value: totalUsers.toString(), trend: `${totalUsers} total`, icon: '💰' },
        { title: 'Clases Hoy', value: (classesToday || 0).toString(), trend: 'Active', icon: '📅' },
        { title: 'Retención', value: '94%', trend: '+1%', icon: '📈' },
    ];

    // Fetch recent activity
    const { data: recentProfiles } = await supabase
        .from('profiles')
        .select('full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} delay={i * 0.05} />
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#2c2c2e] rounded-2xl p-6 border border-[#3a3a3c]">
                    <h3 className="text-lg font-bold mb-4 text-white">Actividad Reciente</h3>
                    <div className="space-y-4">
                        {recentProfiles?.map((profile, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-[#1c1c1e] rounded-xl border border-[#3a3a3c]/50 hover:bg-[#3a3a3c]/30 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm text-gray-300">
                                        {profile.full_name || 'Usuario'} se registró
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(profile.created_at).toLocaleDateString('es-AR')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#2c2c2e] rounded-2xl p-6 border border-[#3a3a3c]">
                    <h3 className="text-lg font-bold mb-4 text-white">Membresías por Vencer (Próximos 7 días)</h3>
                    <div className="space-y-4">
                        {expiringMemberships?.length === 0 && <p className="text-gray-500 text-sm">No hay membresías por vencer pronto.</p>}
                        {expiringMemberships?.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">{m.full_name}</span>
                                    <span className="text-xs text-red-400">Vence: {new Date(m.membership_end_date).toLocaleDateString('es-AR')}</span>
                                </div>
                                <Link
                                    href={`/admin/users?search=${m.full_name}`}
                                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                                >
                                    Ver Info
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#2c2c2e] rounded-2xl p-6 border border-[#3a3a3c]">
                    <h3 className="text-lg font-bold mb-4 text-white">Estado del Sistema</h3>
                    <div className="space-y-4">
                        <SystemStatus label="Base de Datos" status="Operational" color="bg-green-500" />
                        <SystemStatus label="API IA (Gemini)" status={globalThis.process?.env?.GEMINI_API_KEY ? "Active" : "Standby"} color={globalThis.process?.env?.GEMINI_API_KEY ? "bg-green-500" : "bg-yellow-500"} />
                        <SystemStatus label="Supabase" status="Operational" color="bg-green-500" />
                        <SystemStatus label="Autenticación" status="Operational" color="bg-green-500" />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickAction icon="👥" label="Gestionar Usuarios" href="/admin/users" />
                    <QuickAction icon="💳" label="Ver Finanzas" href="/admin/finance" />
                    <QuickAction icon="⚙️" label="Configuración" href="/admin/settings" />
                    <QuickAction icon="📊" label="Reportes" href="/admin/reports" />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon }: any) {
    return (
        <div className="bg-[#2c2c2e] p-6 rounded-2xl border border-[#3a3a3c] hover:border-orange-500/30 transition-all group cursor-pointer hover:scale-105 duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#1c1c1e] rounded-lg text-xl group-hover:scale-110 transition-transform">{icon}</div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-green-500/10 text-green-500">{trend}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold text-white mt-1 group-hover:text-orange-500 transition-colors">{value}</p>
        </div>
    );
}

function SystemStatus({ label, status, color }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
            <span className="text-gray-300 font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color} animate-pulse`}></div>
                <span className="text-sm text-gray-400 font-semibold">{status}</span>
            </div>
        </div>
    );
}

function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
    return (
        <a
            href={href}
            className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all group cursor-pointer"
        >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium text-center">{label}</span>
        </a>
    );
}
