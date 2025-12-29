import { logger } from './logger';

export type AlertType = 'security' | 'operational' | 'system';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    timestamp: Date;
    resolved: boolean;
}

class AlertSystem {
    private alerts: Alert[] = [];
    private listeners: ((alert: Alert) => void)[] = [];

    /**
     * Crear una nueva alerta
     */
    createAlert(
        type: AlertType,
        severity: AlertSeverity,
        title: string,
        message: string,
        metadata?: Record<string, any>
    ): Alert {
        const alert: Alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity,
            title,
            message,
            metadata,
            timestamp: new Date(),
            resolved: false
        };

        this.alerts.push(alert);
        logger.warn(`[ALERT] ${severity.toUpperCase()} - ${title}: ${message}`, metadata);

        // Notificar a listeners
        this.notifyListeners(alert);

        // Auto-enviar email para alertas críticas
        if (severity === 'critical') {
            this.sendEmailNotification(alert);
        }

        return alert;
    }

    /**
     * Alertas de seguridad
     */
    security = {
        multipleFailedLogins: (userId: string, ipAddress: string, attempts: number) => {
            return this.createAlert(
                'security',
                attempts >= 5 ? 'critical' : 'high',
                'Múltiples intentos de login fallidos',
                `Se detectaron ${attempts} intentos fallidos desde la IP ${ipAddress}`,
                { userId, ipAddress, attempts }
            );
        },

        suspiciousIP: (ipAddress: string, reason: string) => {
            return this.createAlert(
                'security',
                'high',
                'Actividad sospechosa detectada',
                `IP ${ipAddress}: ${reason}`,
                { ipAddress, reason }
            );
        },

        unauthorizedAccess: (userId: string, resource: string) => {
            return this.createAlert(
                'security',
                'critical',
                'Intento de acceso no autorizado',
                `Usuario ${userId} intentó acceder a ${resource} sin permisos`,
                { userId, resource }
            );
        },

        dataExfiltration: (userId: string, dataVolume: number) => {
            return this.createAlert(
                'security',
                'critical',
                'Posible exfiltración de datos',
                `Usuario ${userId} descargó ${dataVolume}MB de datos`,
                { userId, dataVolume }
            );
        }
    };

    /**
     * Alertas operacionales
     */
    operational = {
        pendingPayment: (userId: string, amount: number, days: number) => {
            return this.createAlert(
                'operational',
                days >= 7 ? 'high' : 'medium',
                'Pago pendiente',
                `Usuario ${userId} tiene un pago pendiente de $${amount} hace ${days} días`,
                { userId, amount, days }
            );
        },

        routineNotApproved: (routineId: string, studentId: string, days: number) => {
            return this.createAlert(
                'operational',
                days >= 3 ? 'medium' : 'low',
                'Rutina sin aprobar',
                `Rutina ${routineId} del alumno ${studentId} lleva ${days} días sin aprobar`,
                { routineId, studentId, days }
            );
        },

        inactiveUser: (userId: string, days: number) => {
            return this.createAlert(
                'operational',
                'low',
                'Usuario inactivo',
                `Usuario ${userId} no ha iniciado sesión en ${days} días`,
                { userId, days }
            );
        },

        lowInventory: (equipmentId: string, quantity: number) => {
            return this.createAlert(
                'operational',
                quantity === 0 ? 'high' : 'medium',
                'Inventario bajo',
                `Equipo ${equipmentId} tiene solo ${quantity} unidades disponibles`,
                { equipmentId, quantity }
            );
        }
    };

    /**
     * Alertas de sistema
     */
    system = {
        highErrorRate: (service: string, errorRate: number) => {
            return this.createAlert(
                'system',
                errorRate >= 10 ? 'critical' : 'high',
                'Tasa de errores elevada',
                `Servicio ${service} tiene ${errorRate}% de errores`,
                { service, errorRate }
            );
        },

        slowResponse: (endpoint: string, responseTime: number) => {
            return this.createAlert(
                'system',
                responseTime >= 5000 ? 'high' : 'medium',
                'Respuesta lenta',
                `Endpoint ${endpoint} respondió en ${responseTime}ms`,
                { endpoint, responseTime }
            );
        },

        databaseConnection: (error: string) => {
            return this.createAlert(
                'system',
                'critical',
                'Error de conexión a base de datos',
                error,
                { error }
            );
        }
    };

    /**
     * Resolver una alerta
     */
    resolveAlert(alertId: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            logger.info(`[ALERT] Alerta resuelta: ${alertId}`);
            return true;
        }
        return false;
    }

    /**
     * Obtener alertas activas
     */
    getActiveAlerts(type?: AlertType, severity?: AlertSeverity): Alert[] {
        return this.alerts.filter(alert => {
            if (alert.resolved) return false;
            if (type && alert.type !== type) return false;
            if (severity && alert.severity !== severity) return false;
            return true;
        });
    }

    /**
     * Suscribirse a nuevas alertas
     */
    subscribe(listener: (alert: Alert) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notificar a listeners
     */
    private notifyListeners(alert: Alert): void {
        this.listeners.forEach(listener => {
            try {
                listener(alert);
            } catch (error) {
                logger.error('Error notifying alert listener:', error);
            }
        });
    }

    /**
     * Enviar notificación por email
     */
    private async sendEmailNotification(alert: Alert): Promise<void> {
        try {
            // TODO: Implementar con Resend
            logger.info(`[EMAIL] Enviando notificación de alerta crítica: ${alert.title}`);

            // await fetch('/api/notifications/send-email', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         to: 'admin@virtud.com',
            //         subject: `[CRÍTICO] ${alert.title}`,
            //         body: alert.message
            //     })
            // });
        } catch (error) {
            logger.error('Error sending email notification:', error);
        }
    }
}

// Singleton
export const alertSystem = new AlertSystem();

// Ejemplos de uso:
// alertSystem.security.multipleFailedLogins('user123', '192.168.1.1', 5);
// alertSystem.operational.pendingPayment('user456', 5000, 10);
// alertSystem.system.highErrorRate('api/payments', 15);
