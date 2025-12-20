'use client';

import { useState, useEffect } from 'react';
import { Line, Pie } from 'recharts';
import toast from 'react-hot-toast';

interface SecurityAlert {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId: string;
    userName: string;
    routineId: string;
    routineName: string;
    timestamp: Date;
    details: any;
    resolved: boolean;
}

interface SecurityStats {
    last24h: {
        totalAccesses: number;
        uniqueUsers: number;
        screenshotAttempts: number;
        devtoolsDetections: number;
        suspiciousActivities: number;
    };
    trends: {
        accessesTrend: 'up' | 'down' | 'stable';
        violationsTrend: 'up' | 'down' | 'stable';
    };
}

export default function SecurityDashboardPage() {
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [stats, setStats] = useState<SecurityStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'unresolved'>('all');

    useEffect(() => {
        loadSecurityData();

        // Actualizar cada 30 segundos
        const interval = setInterval(loadSecurityData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadSecurityData = async () => {
        try {
            const response = await fetch('/api/admin/security/dashboard');
            const data = await response.json();

            if (data.success) {
                setAlerts(data.alerts);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar datos de seguridad');
        } finally {
            setLoading(false);
        }
    };

    const resolveAlert = async (alertId: string) => {
        try {
            await fetch(`/api/admin/security/alerts/${alertId}/resolve`, {
                method: 'POST'
            });

            toast.success('Alerta marcada como resuelta');
            loadSecurityData();
        } catch (error) {
            toast.error('Error al resolver alerta');
        }
    };

    const exportReport = async () => {
        try {
            const response = await fetch('/api/admin/security/export');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `security-report-${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();

            toast.success('Reporte exportado');
        } catch (error) {
            toast.error('Error al exportar reporte');
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        switch (filter) {
            case 'critical':
                return alert.severity === 'critical';
            case 'high':
                return alert.severity === 'high' || alert.severity === 'critical';
            case 'unresolved':
                return !alert.resolved;
            default:
                return true;
        }
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-400';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-yellow-400';
            default: return 'text-blue-400';
        }
    };

    const getActionLabel = (type: string) => {
        const labels: Record<string, string> = {
            'screenshot_attempt': '📸 Intento de Screenshot',
            'devtools_detected': '🔧 DevTools Detectado',
            'suspicious_quick_exit': '⚡ Salida Rápida Sospechosa',
            'suspicious_long_press': '👆 Long-Press Detectado',
            'suspicious_repeated_views': '🔄 Vistas Repetidas',
            'orientation_change': '🔄 Cambio de Orientación',
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Cargando dashboard de seguridad...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">🔐 Dashboard de Seguridad</h1>
                        <p className="text-gray-400">Monitoreo de accesos y alertas en tiempo real</p>
                    </div>
                    <button
                        onClick={exportReport}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                    >
                        📊 Exportar Reporte
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="text-gray-400 text-sm mb-2">Accesos (24h)</div>
                            <div className="text-3xl font-bold text-white">{stats.last24h.totalAccesses}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {stats.last24h.uniqueUsers} usuarios únicos
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-red-500/30">
                            <div className="text-gray-400 text-sm mb-2">Screenshots</div>
                            <div className="text-3xl font-bold text-red-400">{stats.last24h.screenshotAttempts}</div>
                            <div className="text-xs text-red-300 mt-1">Intentos bloqueados</div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-orange-500/30">
                            <div className="text-gray-400 text-sm mb-2">DevTools</div>
                            <div className="text-3xl font-bold text-orange-400">{stats.last24h.devtoolsDetections}</div>
                            <div className="text-xs text-orange-300 mt-1">Detecciones</div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/30">
                            <div className="text-gray-400 text-sm mb-2">Sospechosos</div>
                            <div className="text-3xl font-bold text-yellow-400">{stats.last24h.suspiciousActivities}</div>
                            <div className="text-xs text-yellow-300 mt-1">Comportamientos</div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="text-gray-400 text-sm mb-2">Tendencia</div>
                            <div className="flex items-center gap-2">
                                {stats.trends.violationsTrend === 'up' && (
                                    <span className="text-2xl">📈</span>
                                )}
                                {stats.trends.violationsTrend === 'down' && (
                                    <span className="text-2xl">📉</span>
                                )}
                                {stats.trends.violationsTrend === 'stable' && (
                                    <span className="text-2xl">➡️</span>
                                )}
                                <span className="text-white font-semibold capitalize">{stats.trends.violationsTrend}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Todas ({alerts.length})
                        </button>
                        <button
                            onClick={() => setFilter('critical')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'critical'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Críticas ({alerts.filter(a => a.severity === 'critical').length})
                        </button>
                        <button
                            onClick={() => setFilter('high')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'high'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Altas ({alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length})
                        </button>
                        <button
                            onClick={() => setFilter('unresolved')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'unresolved'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Sin Resolver ({alerts.filter(a => !a.resolved).length})
                        </button>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">🚨 Alertas Recientes</h2>

                    {filteredAlerts.length === 0 ? (
                        <div className="bg-gray-800 rounded-lg p-8 text-center">
                            <p className="text-gray-400">No hay alertas que mostrar</p>
                        </div>
                    ) : (
                        filteredAlerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`bg-gray-800 rounded-lg p-6 border-l-4 ${alert.resolved ? 'border-gray-600 opacity-60' : `border-${getSeverityColor(alert.severity).split('-')[1]}-500`
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded text-xs font-bold ${getSeverityColor(alert.severity)} text-white uppercase`}>
                                            {alert.severity}
                                        </span>
                                        <span className={`text-lg font-semibold ${getSeverityTextColor(alert.severity)}`}>
                                            {getActionLabel(alert.type)}
                                        </span>
                                        {alert.resolved && (
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                                ✓ Resuelto
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-400">
                                        {new Date(alert.timestamp).toLocaleString('es-AR')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Usuario:</span>
                                        <span className="text-white ml-2 font-medium">{alert.userName}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Rutina:</span>
                                        <span className="text-white ml-2 font-medium">{alert.routineName}</span>
                                    </div>
                                </div>

                                {alert.details && (
                                    <div className="bg-gray-700/50 rounded p-3 mb-4">
                                        <div className="text-xs text-gray-400 mb-1">Detalles:</div>
                                        <pre className="text-xs text-gray-300 overflow-x-auto">
                                            {JSON.stringify(alert.details, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {!alert.resolved && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => resolveAlert(alert.id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                        >
                                            ✓ Marcar Resuelto
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                        >
                                            👤 Ver Usuario
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
