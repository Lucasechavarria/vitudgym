import { NextRequest } from 'next/server';
import { GET } from '../coach/students/route';

// Mock de Supabase
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => ({
        auth: {
            getUser: jest.fn(() => Promise.resolve({
                data: {
                    user: { id: 'coach123' }
                },
                error: null
            }))
        },
        from: jest.fn((table) => {
            if (table === 'profiles') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(function () { return this; }),
                        or: jest.fn(function () { return this; }),
                        in: jest.fn(function () { return this; }),
                        order: jest.fn(function () {
                            // Si estamos en la cadena de Profiles, devolver los datos de prueba
                            if (table === 'profiles') {
                                return Promise.resolve({
                                    data: [
                                        { id: '1', full_name: 'Student 1', role: 'member' },
                                        { id: '2', full_name: 'Student 2', role: 'member' }
                                    ],
                                    error: null
                                });
                            }
                            return this;
                        }),
                        single: jest.fn(() => Promise.resolve({
                            data: { id: 'coach123', role: 'coach' },
                            error: null
                        }))
                    }))
                };
            }
            if (table === 'user_goals') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            eq: jest.fn(() => ({
                                order: jest.fn(() => ({
                                    limit: jest.fn(() => ({
                                        single: jest.fn(() => Promise.resolve({
                                            data: { id: 'goal1', primary_goal: 'Hypertrophy' },
                                            error: null
                                        }))
                                    }))
                                }))
                            }))
                        }))
                    }))
                };
            }
            if (table === 'routines') {
                return {
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            eq: jest.fn(() => ({
                                single: jest.fn(() => Promise.resolve({
                                    data: { id: 'routine1', name: 'Morning Workout' },
                                    error: null
                                }))
                            }))
                        }))
                    }))
                };
            }
            return {
                select: jest.fn(() => ({
                    eq: jest.fn(() => Promise.resolve({
                        data: [],
                        error: null
                    }))
                }))
            };
        })
    }))
}));

describe('Coach API Routes', () => {
    describe('GET /api/coach/students', () => {
        it('should return students list for coach', async () => {
            const request = new NextRequest('http://localhost:3000/api/coach/students');

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(Array.isArray(data.students)).toBe(true);
            expect(data.students.length).toBeGreaterThan(0);
        });

        it('should return 401 for unauthenticated user', async () => {
            const mockCreateClient = require('@/lib/supabase/server').createClient;
            mockCreateClient.mockImplementationOnce(() => ({
                auth: {
                    getUser: jest.fn(() => Promise.resolve({
                        data: { user: null },
                        error: { message: "Auth error" }
                    }))
                }
            }));

            const request = new NextRequest('http://localhost:3000/api/coach/students');
            const response = await GET(request);

            expect(response.status).toBe(401);
        });

        it('should return 403 for non-coach user', async () => {
            const mockCreateClient = require('@/lib/supabase/server').createClient;
            mockCreateClient.mockImplementationOnce(() => ({
                auth: {
                    getUser: jest.fn(() => Promise.resolve({
                        data: {
                            user: { id: 'user123' }
                        },
                        error: null
                    }))
                },
                from: jest.fn(() => ({
                    select: jest.fn(() => ({
                        eq: jest.fn(() => ({
                            single: jest.fn(() => Promise.resolve({
                                data: { id: 'user123', role: 'member' },
                                error: null
                            }))
                        }))
                    }))
                }))
            }));

            const request = new NextRequest('http://localhost:3000/api/coach/students');
            const response = await GET(request);

            expect(response.status).toBe(403);
        });


    });
});
