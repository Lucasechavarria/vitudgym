import { NextRequest } from 'next/server';

// Mock de Supabase
// Mock de Supabase
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => ({
        auth: {
            getUser: jest.fn(() => Promise.resolve({
                data: {
                    user: { id: 'user123', email: 'test@example.com' }
                },
                error: null
            }))
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({
                        data: { id: 'user123', full_name: 'Test User' },
                        error: null
                    }))
                }))
            }))
        }))
    }))
}));

// Mock de MercadoPago
jest.mock('mercadopago', () => ({
    MercadoPagoConfig: jest.fn(),
    Preference: jest.fn(() => ({
        create: jest.fn(() => Promise.resolve({
            id: 'pref123',
            init_point: 'https://mercadopago.com/checkout/pref123'
        }))
    }))
}));

describe('Payments API Routes', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('POST /api/payments/create-checkout', () => {
        it('should create checkout session successfully', async () => {
            process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST_TOKEN_123';
            const { POST } = require('../payments/create-checkout/route');

            const request = new NextRequest('http://localhost:3000/api/payments/create-checkout', {
                method: 'POST',
                body: JSON.stringify({
                    userId: 'user123',
                    userEmail: 'test@example.com',
                    title: 'Membresía',
                    price: 5000,
                    quantity: 1
                })
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveProperty('checkoutUrl');
            expect(data).toHaveProperty('preferenceId');
        });

        it('should return 401 for unauthenticated user', async () => {
            process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST_TOKEN_123';
            const { POST } = require('../payments/create-checkout/route');

            // Mock sin sesión
            const mockCreateClient = require('@/lib/supabase/server').createClient;
            mockCreateClient.mockImplementationOnce(() => ({
                auth: {
                    getUser: jest.fn(() => Promise.resolve({
                        data: { user: null },
                        error: { message: "No session" }
                    }))
                }
            }));

            const request = new NextRequest('http://localhost:3000/api/payments/create-checkout', {
                method: 'POST',
                body: JSON.stringify({
                    userId: 'user123',
                    userEmail: 'test@example.com',
                    title: 'Membresía',
                    price: 5000
                })
            });

            const response = await POST(request);
            expect(response.status).toBe(401);
        });

        it('should return 400 for missing required fields', async () => {
            process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST_TOKEN_123';
            const { POST } = require('../payments/create-checkout/route');

            const request = new NextRequest('http://localhost:3000/api/payments/create-checkout', {
                method: 'POST',
                body: JSON.stringify({
                    description: 'Test'
                })
            });

            const response = await POST(request);
            expect(response.status).toBe(400);
        });
    });
});
