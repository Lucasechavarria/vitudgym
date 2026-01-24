/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';

// Mock Supabase Client
const mockSupabase = {
    from: jest.fn(() => ({
        select: jest.fn(() => ({
            eq: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({ data: [], error: null }))
            }))
        })),
        insert: jest.fn(() => Promise.resolve({ error: null }))
    })),
    channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn()
    })),
    removeChannel: jest.fn()
};

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabase
}));

describe('useChat Hook', () => {
    it('should initialize with empty messages', async () => {
        const { result } = renderHook(() => useChat('chat-123'));

        expect(result.current.messages).toEqual([]);
        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('should send a message successfully', async () => {
        const { result } = renderHook(() => useChat('chat-123'));
        await waitFor(() => expect(result.current.loading).toBe(false)); // Wait for initial load

        let success;
        await act(async () => {
            success = await result.current.sendMessage('Hello World', 'user-1', 'user-2');
        });

        expect(success).toBe(true);
        expect(mockSupabase.from).toHaveBeenCalledWith('mensajes');
    });
});
