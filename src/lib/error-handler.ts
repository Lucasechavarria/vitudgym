import { logger } from './logger';

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'No autenticado') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'No autorizado') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Recurso no encontrado') {
        super(message, 404, 'NOT_FOUND_ERROR');
        this.name = 'NotFoundError';
    }
}

export const handleApiError = (error: any) => {
    logger.error('API Error', {
        error: error.message,
        stack: error.stack,
        code: error.code
    });

    if (error instanceof AppError) {
        return {
            error: error.message,
            code: error.code,
            statusCode: error.statusCode,
            details: error.details
        };
    }

    // Error de Supabase
    if (error.code && error.message) {
        return {
            error: error.message,
            code: error.code,
            statusCode: 500
        };
    }

    return {
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: 500
    };
};
