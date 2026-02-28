import { Resend } from 'resend';
import { logger } from './logger';

// La inicialización de Resend debe ser perezosa para evitar errores durante la compilación
// si la variable de entorno RESEND_API_KEY no está presente.
let resendInstance: Resend | null = null;

const getResend = () => {
    if (!resendInstance) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey && process.env.NODE_ENV === 'production') {
            logger.warn('⚠️ RESEND_API_KEY no detectada. Los correos no se enviarán.');
            // Retornamos un stub o lanzamos error solo al intentar usarlo
            return new Resend('re_vacio_si_no_hay_key');
        }
        resendInstance = new Resend(apiKey || 're_vacio');
    }
    return resendInstance;
};

export type EmailTemplate =
    | 'welcome'
    | 'email-verification'
    | 'password-reset'
    | 'payment-approved'
    | 'payment-rejected'
    | 'security-alert'
    | 'routine-approved'
    | 'routine-rejected'
    | 'newsletter';

interface EmailOptions {
    to: string | string[];
    subject: string;
    template: EmailTemplate;
    data: Record<string, unknown>;
}

/**
 * Enviar email usando Resend
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
    try {
        const html = generateEmailHTML(options.template, options.data);

        const resend = getResend();
        await resend.emails.send({
            from: 'Virtud Gym <onboarding@resend.dev>',
            to: options.to,
            subject: options.subject,
            html
        });

        logger.info(`Email enviado: ${options.template} a ${options.to}`);
    } catch (error) {
        logger.error('Error sending email:', { error: error instanceof Error ? error.message : error });
        throw new Error('Error al enviar email');
    }
}

/**
 * Generar HTML del email según template
 */
function generateEmailHTML(template: EmailTemplate, data: Record<string, unknown>): string {
    const baseStyle = `
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF5722 0%, #FF9800 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #FF5722; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
    `;

    switch (template) {
        case 'welcome':
            return `
                ${baseStyle}
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido a Virtud Gym! 🎉</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${data.name}</strong>,</p>
                        <p>Estamos emocionados de tenerte con nosotros. Tu cuenta ha sido creada exitosamente.</p>
                        <p>Ahora puedes acceder a tu dashboard y comenzar tu viaje fitness.</p>
                        <a href="${data.dashboardUrl}" class="button">Ir al Dashboard</a>
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Virtud Gym. Todos los derechos reservados.</p>
                    </div>
                </div>
            `;

        case 'email-verification':
            return `
                ${baseStyle}
                <div class="container">
                    <div class="header">
                        <h1>Verifica tu Email 📧</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${data.name}</strong>,</p>
                        <p>Por favor, verifica tu dirección de email haciendo clic en el botón de abajo:</p>
                        <a href="${data.verificationUrl}" class="button">Verificar Email</a>
                        <p>Este enlace expirará en 24 horas.</p>
                        <p>Si no solicitaste esta verificación, puedes ignorar este email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Virtud Gym. Todos los derechos reservados.</p>
                    </div>
                </div>
            `;

        case 'password-reset':
            return `
                ${baseStyle}
                <div class="container">
                    <div class="header">
                        <h1>Restablecer Contraseña 🔐</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${data.name}</strong>,</p>
                        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                        <a href="${data.resetUrl}" class="button">Restablecer Contraseña</a>
                        <p>Este enlace expirará en 1 hora.</p>
                        <p>Si no solicitaste este cambio, ignora este email y tu contraseña permanecerá sin cambios.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Virtud Gym. Todos los derechos reservados.</p>
                    </div>
                </div>
            `;

        case 'payment-approved':
            return `
                ${baseStyle}
                <div class="container">
                    <div class="header">
                        <h1>Pago Aprobado ✅</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${data.name}</strong>,</p>
                        <p>Tu pago de <strong>$${data.amount}</strong> ha sido aprobado exitosamente.</p>
                        <p><strong>ID de Transacción:</strong> ${data.transactionId}</p>
                        <p><strong>Fecha:</strong> ${new Date(data.date as string).toLocaleDateString('es-AR')}</p>
                        <p>Gracias por tu pago. Tu membresía está activa.</p>
                        <a href="${data.dashboardUrl}" class="button">Ver Dashboard</a>
                    </div>
                    <div class="footer">
                        <p>© 2024 Virtud Gym. Todos los derechos reservados.</p>
                    </div>
                </div>
            `;

        case 'payment-rejected':
            return `
                ${baseStyle}
                <div class="container">
                    <div class="header" style="background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);">
                        <h1>Pago Rechazado ❌</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${data.name}</strong>,</p>
                        <p>Lamentablemente, tu pago de <strong>$${data.amount}</strong> fue rechazado.</p>
                        <p><strong>Razón:</strong> ${data.reason}</p>
                        <p>Por favor, intenta nuevamente con otro método de pago.</p>
                        <a href="${data.retryUrl}" class="button">Reintentar Pago</a>
                    </div>
                    <div class="footer">
                        <p>© 2024 Virtud Gym. Todos los derechos reservados.</p>
                    </div>
                </div>
            `;

        case 'security-alert':
            return `
                ${baseStyle}
                <div class="container">
                    <div class="header" style="background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);">
                        <h1>Alerta de Seguridad ⚠️</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${data.name}</strong>,</p>
                        <p>Detectamos actividad inusual en tu cuenta:</p>
                        <p><strong>${data.alertTitle}</strong></p>
                        <p>${data.alertMessage}</p>
                        <p><strong>Fecha:</strong> ${new Date(data.date as string).toLocaleString('es-AR')}</p>
                        <p>Si no reconoces esta actividad, cambia tu contraseña inmediatamente.</p>
                        <a href="${data.securityUrl}" class="button">Revisar Seguridad</a>
                    </div>
                    <div class="footer">
                        <p>© 2024 Virtud Gym. Todos los derechos reservados.</p>
                    </div>
                </div>
            `;

        case 'routine-approved':
            return `
                ${baseStyle}
                <div class="container">
                    <div class="header" style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);">
                        <h1>Rutina Aprobada ✅</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${data.name}</strong>,</p>
                        <p>Tu rutina ha sido aprobada por tu coach <strong>${data.coachName}</strong>.</p>
                        <p>Ya puedes comenzar a seguir tu nueva rutina de entrenamiento.</p>
                        <a href="${data.routineUrl}" class="button">Ver Rutina</a>
                    </div>
                    <div class="footer">
                        <p>© 2024 Virtud Gym. Todos los derechos reservados.</p>
                    </div>
                </div>
            `;

        case 'routine-rejected':
            return `
                ${baseStyle}
                <div class="container">
                    <div class="header" style="background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);">
                        <h1>Rutina Requiere Cambios 📝</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>${data.name}</strong>,</p>
                        <p>Tu coach <strong>${data.coachName}</strong> ha solicitado cambios en tu rutina.</p>
                        <p><strong>Comentarios:</strong></p>
                        <p>${data.comments}</p>
                        <a href="${data.routineUrl}" class="button">Ver Detalles</a>
                    </div>
                    <div class="footer">
                        <p>© 2024 Virtud Gym. Todos los derechos reservados.</p>
                    </div>
                </div>
            `;

        case 'newsletter':
            return `
                ${baseStyle}
                <div class="container">
                    <div class="header">
                        <h1>${data.title} 📢</h1>
                    </div>
                    <div class="content">
                        <div style="font-size: 16px; color: #333; line-height: 1.8;">
                            ${data.content}
                        </div>
                        ${data.actionUrl ? `
                            <div style="text-align: center;">
                                <a href="${data.actionUrl}" class="button">${data.actionText || 'Ver más detalles'}</a>
                            </div>
                        ` : ''}
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #999;">Esta es una comunicación oficial de Virtud Gym para todos sus miembros.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Virtud Gym. Todos los derechos reservados.</p>
                    </div>
                </div>
            `;

        default:
            return '<p>Email template not found</p>';
    }
}

/**
 * Helpers para enviar emails específicos
 */
export const emails = {
    welcome: (to: string, name: string, dashboardUrl: string) =>
        sendEmail({
            to,
            subject: '¡Bienvenido a Virtud Gym!',
            template: 'welcome',
            data: { name, dashboardUrl }
        }),

    emailVerification: (to: string, name: string, verificationUrl: string) =>
        sendEmail({
            to,
            subject: 'Verifica tu email - Virtud Gym',
            template: 'email-verification',
            data: { name, verificationUrl }
        }),

    passwordReset: (to: string, name: string, resetUrl: string) =>
        sendEmail({
            to,
            subject: 'Restablecer contraseña - Virtud Gym',
            template: 'password-reset',
            data: { name, resetUrl }
        }),

    paymentApproved: (to: string, name: string, amount: number, transactionId: string, dashboardUrl: string) =>
        sendEmail({
            to,
            subject: 'Pago aprobado - Virtud Gym',
            template: 'payment-approved',
            data: { name, amount, transactionId, date: new Date(), dashboardUrl }
        }),

    paymentRejected: (to: string, name: string, amount: number, reason: string, retryUrl: string) =>
        sendEmail({
            to,
            subject: 'Pago rechazado - Virtud Gym',
            template: 'payment-rejected',
            data: { name, amount, reason, retryUrl }
        }),

    securityAlert: (to: string, name: string, alertTitle: string, alertMessage: string, securityUrl: string) =>
        sendEmail({
            to,
            subject: `Alerta de Seguridad - ${alertTitle}`,
            template: 'security-alert',
            data: { name, alertTitle, alertMessage, date: new Date(), securityUrl }
        }),

    routineApproved: (to: string, name: string, coachName: string, routineUrl: string) =>
        sendEmail({
            to,
            subject: 'Tu rutina ha sido aprobada - Virtud Gym',
            template: 'routine-approved',
            data: { name, coachName, routineUrl }
        }),

    routineRejected: (to: string, name: string, coachName: string, comments: string, routineUrl: string) =>
        sendEmail({
            to,
            subject: 'Tu rutina requiere cambios - Virtud Gym',
            template: 'routine-rejected',
            data: { name, coachName, comments, routineUrl }
        }),

    newsletter: (to: string[], title: string, content: string, actionUrl?: string, actionText?: string) =>
        sendEmail({
            to,
            subject: title,
            template: 'newsletter',
            data: { title, content, actionUrl, actionText }
        })
};
