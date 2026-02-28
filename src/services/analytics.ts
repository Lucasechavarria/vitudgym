import { logger } from '@/lib/logger';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export const initAnalytics = () => {
    // Initialize GA if needed, usually handled by a Script component in layout
    // This function can be used for custom initialization logic
    logger.info('Analytics initialized');
};

export const logEvent = (action: string, params: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', action, params);
    } else {
        logger.info('Analytics Event:', { action, params });
    }
};

export const pageview = (url: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', GA_MEASUREMENT_ID, {
            page_path: url,
        });
    }
};
