import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Virtud Gym API',
            version: '1.0.0',
            description: 'API para gestión de gimnasio con IA, Gamificación y Seguimiento en Tiempo Real',
            contact: {
                name: 'Soporte Virtud Gym',
                email: 'soporte@virtudgym.com',
            },
        },
        servers: [
            {
                url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                description: 'Servidor Actual',
            },
            {
                url: 'https://api.virtudgym.com',
                description: 'Producción',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Perfil: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        nombre_completo: { type: 'string' },
                        rol: { type: 'string', enum: ['admin', 'coach', 'member'] },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Paths to files containing OpenAPI definitions
    apis: ['./src/app/api/**/*.ts', './src/lib/validations/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
