import { AIService } from '../ai.service';
import { TRAINING_GOALS } from '@/lib/constants/gym';

// Mock Gemini AI
jest.mock('@/lib/config/gemini', () => ({
    aiClient: {
        getGenerativeModel: jest.fn(),
    },
    DEFAULT_MODEL: 'gemini-3-flash-preview',
    RoutineSchema: { parse: jest.fn() },
    SAFETY_SETTINGS: []
}));

import { aiClient } from '@/lib/config/gemini';
import { zodToJsonSchema } from 'zod-to-json-schema';

jest.mock('zod-to-json-schema', () => ({
    zodToJsonSchema: jest.fn().mockReturnValue({ type: 'object' })
}));

describe('AIService', () => {
    let aiService: AIService;

    const mockStudentProfile = {
        full_name: 'Juan Pérez',
        date_of_birth: '1995-01-01',
        medical_info: {
            chronic_diseases: 'Ninguna',
            injuries: 'Rodilla izquierda',
            weight: 75
        },
        coach_observations: 'Intermedio'
    };

    const mockUserGoal = {
        primary_goal: 'Hipertrofia',
        secondary_goals: ['Fuerza'],
        training_frequency_per_week: 4,
        time_per_session_minutes: 60
    };

    const mockGymEquipment = [
        { id: '1', name: 'Barra Olímpica', category: 'Pesos Libres' },
        { id: '2', name: 'Mancuernas', category: 'Pesos Libres' }
    ];

    beforeEach(() => {
        aiService = new AIService();
        jest.clearAllMocks();
    });

    describe('buildPrompt', () => {
        it('should construct a valid prompt with student data', () => {
            const prompt = aiService.buildPrompt({
                studentProfile: mockStudentProfile,
                userGoal: mockUserGoal,
                gymEquipment: mockGymEquipment,
                coachNotes: 'Test notes',
                includeNutrition: true
            });

            expect(prompt).toContain('Juan Pérez');
            expect(prompt).toContain('Rodilla izquierda');
            expect(prompt).toContain('Hipertrofia');
            expect(prompt).toContain('Barra Olímpica');
            expect(prompt).toContain('Test notes');
            expect(prompt).toContain('plan_nutricional');
            expect(prompt).toContain('PROTOCOLO DE SEGURIDAD LEGAL');
        });

        it('should use the correct template based on goal', () => {
            const prompt = aiService.buildPrompt({
                studentProfile: mockStudentProfile,
                userGoal: { ...mockUserGoal, primary_goal: 'Rehabilitación' },
                gymEquipment: mockGymEquipment
            });

            expect(prompt).toContain('ENFOQUE: REHABILITACIÓN');
        });
    });

    describe('generateRoutineFromPrompt', () => {
        it('should parse valid JSON response from Gemini', async () => {
            const mockRoutine = {
                routineName: 'Test Routine',
                durationWeeks: 8,
                weeklySchedule: []
            };

            const mockGenerateContent = jest.fn().mockResolvedValue({
                response: {
                    text: jest.fn().mockReturnValue(JSON.stringify(mockRoutine))
                }
            });

            (aiClient.getGenerativeModel as jest.Mock).mockReturnValue({
                generateContent: mockGenerateContent
            });

            const result = await aiService.generateRoutineFromPrompt('Dummy prompt');

            expect(result).toEqual(mockRoutine);
            expect(aiClient.getGenerativeModel).toHaveBeenCalledTimes(1);
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        });

        it('should throw error if response is not valid JSON', async () => {
            const mockGenerateContent = jest.fn().mockResolvedValue({
                response: {
                    text: jest.fn().mockReturnValue('Invalid JSON')
                }
            });

            (aiClient.getGenerativeModel as jest.Mock).mockReturnValue({
                generateContent: mockGenerateContent
            });

            await expect(
                aiService.generateRoutineFromPrompt('Dummy prompt')
            ).rejects.toThrow('Fallo en la generación de rutina');
        });
    });
});
