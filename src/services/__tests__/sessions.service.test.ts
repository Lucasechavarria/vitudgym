
import { SessionsService } from '../sessions.service';

// Mock de Supabase
const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ single: mockSingle }));
const mockUpdate = jest.fn(() => ({ eq: jest.fn(() => ({ select: mockSelect })) }));
const mockInsert = jest.fn(() => ({ select: mockSelect }));
const mockFrom = jest.fn(() => ({
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect,
    eq: jest.fn(function () { return this; }),
    order: jest.fn(function () { return this; }),
    limit: jest.fn(function () { return this; })
}));

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(() => Promise.resolve({
        from: mockFrom
    }))
}));

describe('SessionsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should start a session correctly', async () => {
        mockSingle.mockResolvedValueOnce({ data: { id: 'session123' }, error: null });

        const { session, error } = await SessionsService.startSession('user123', 'routine123');

        expect(mockFrom).toHaveBeenCalledWith('sesiones_de_entrenamiento');
        expect(session.id).toBe('session123');
        expect(error).toBeNull();
    });

    it('should log exercise performance correctly', async () => {
        mockSingle.mockResolvedValueOnce({ data: { id: 'log123' }, error: null });

        const performance = {
            ejercicio_id: 'ex123',
            series_reales: 3,
            repeticiones_reales: '10',
            peso_real: 50,
            fue_completado: true
        };
        const { log, error } = await SessionsService.logExercisePerformance('session123', performance);

        expect(mockFrom).toHaveBeenCalledWith('registros_de_ejercicio');
        expect(log.id).toBe('log123');
        expect(error).toBeNull();
    });

    it('should complete a session and apply points', async () => {
        mockSingle.mockResolvedValueOnce({ data: { id: 'session123', estado: 'completed' }, error: null });

        const { session, error } = await SessionsService.completeSession('session123', 500, 5, 'Great workout');

        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            estado: 'completed',
            puntos_totales: 500
        }));
        expect(session.estado).toBe('completed');
        expect(error).toBeNull();
    });
});
