import { NextRequest } from 'next/server';
import { GET } from '../admin/users/route';

// Mock de Supabase
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => ({
        auth: {
            getUser: jest.fn(() => Promise.resolve({
                data: {
                    user: { id: 'admin123' }
                },
                error: null
            }))
        },
        from: jest.fn((table) => {
            console.log(`Mock DB Request for table: ${table}`);
            return {
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn(() => Promise.resolve({
                            data: { id: 'admin123', role: 'admin' },
                            error: null
                        })),
                        // Support chaining eq().eq() if needed? Probably not for current usage
                    })),
                    order: jest.fn(() => Promise.resolve({
                        data: [
                            { id: '1', full_name: 'User 1', role: 'member' },
                            { id: '2', full_name: 'User 2', role: 'coach' }
                        ],
                        error: null
                    })),
                    // Add other methods if needed
                }))
            };
        })
    }))
}));

describe('Admin API Routes', () => {
    describe('GET /api/admin/users', () => {
        it('should return users list for admin', async () => {
            const request = new NextRequest('http://localhost:3000/api/admin/users');

            const response = await GET(request);
            const bodyText = await response.text();
            const data = JSON.parse(bodyText);

            expect(response.status).toBe(200);
            expect(Array.isArray(data.users)).toBe(true);
            expect(data.users.length).toBeGreaterThan(0);
        });

        it('should return 401 for unauthenticated user', async () => {
            const mockCreateClient = require('@/lib/supabase/server').createClient;
            mockCreateClient.mockImplementationOnce(() => ({
                auth: {
                    getUser: jest.fn(() => Promise.resolve({
                        data: { user: null },
                        error: { message: 'Auth error' }
                    }))
                }
            }));

            const request = new NextRequest('http://localhost:3000/api/admin/users');
            const response = await GET(request);

            expect(response.status).toBe(401);
        });

        it('should return 403 for non-admin user', async () => {
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

            const request = new NextRequest('http://localhost:3000/api/admin/users');
            const response = await GET(request);

            expect(response.status).toBe(403);
        });
    });
});
