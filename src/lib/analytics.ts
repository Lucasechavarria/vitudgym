/**
 * Google Analytics Configuration
 * 
 * Integración con Google Analytics 4 para tracking de eventos y analytics.
 */

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

/**
 * Inicializa Google Analytics
 */
export const initGA = () => {
    if (!GA_TRACKING_ID || typeof window === 'undefined') return;

    // Cargar script de GA
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Inicializar dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
        window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, {
        page_path: window.location.pathname,
    });
};

/**
 * Track page view
 */
export const pageview = (url: string) => {
    if (!GA_TRACKING_ID || typeof window === 'undefined') return;

    window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
    });
};

/**
 * Track custom event
 */
export const event = (
    action: string,
    params?: {
        category?: string;
        label?: string;
        value?: number;
        [key: string]: any;
    }
) => {
    if (!GA_TRACKING_ID || typeof window === 'undefined') return;

    window.gtag('event', action, params);
};

/**
 * Track user login
 */
export const trackLogin = (method: string) => {
    event('login', {
        category: 'engagement',
        label: method,
    });
};

/**
 * Track booking
 */
export const trackBooking = (classId: string, className: string) => {
    event('booking_created', {
        category: 'conversion',
        label: className,
        value: 1,
        class_schedule_id: classId,
    });
};

/**
 * Track routine generation
 */
export const trackRoutineGeneration = (goal: string, studentId: string) => {
    event('routine_generated', {
        category: 'engagement',
        label: goal,
        student_id: studentId,
    });
};

/**
 * Track payment
 */
export const trackPayment = (amount: number, currency: string = 'ARS') => {
    event('purchase', {
        category: 'conversion',
        value: amount,
        currency,
    });
};
