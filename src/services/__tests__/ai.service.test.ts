import { AIService } from '../ai.service';
import { TRAINING_GOALS } from '@/lib/constants/gym';

// Mock Gemini AI
jest.mock('@/lib/config/gemini', () => ({
    model: {
        generateContent: jest.fn(),
    },
    genAI: {
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn()
        })
    }
}));

import { model } from '@/lib/config/gemini';

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

            (model.generateContent as jest.Mock).mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockRoutine),
                },
            });

            const result = await aiService.generateRoutineFromPrompt('Dummy prompt');

            expect(result).toEqual(mockRoutine);
            expect(model.generateContent).toHaveBeenCalledTimes(1);
        });

        it('should throw error if response is not valid JSON', async () => {
            (model.generateContent as jest.Mock).mockResolvedValue({
                response: {
                    text: () => 'Invalid JSON',
                },
            });

            await expect(
                aiService.generateRoutineFromPrompt('Dummy prompt')
            ).rejects.toThrow('La respuesta de la IA no es un JSON válido.');
        });
    });
});
