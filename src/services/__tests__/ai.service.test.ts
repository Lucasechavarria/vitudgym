import { AIService } from '../ai.service';
import { MOCK_STUDENTS } from '@/lib/constants';

// Mock Gemini AI
jest.mock('@/lib/config/gemini', () => ({
    model: {
        generateContent: jest.fn(),
    },
}));

import { model } from '@/lib/config/gemini';

describe('AIService', () => {
    let aiService: AIService;

    beforeEach(() => {
        aiService = new AIService();
        jest.clearAllMocks();
    });

    describe('generateRoutine', () => {
        it('should generate a routine for a valid student', async () => {
            // Mock Gemini response
            const mockRoutine = {
                routineName: 'Test Routine',
                motivationalQuote: 'Test Quote',
                duration: '45 min',
                warmup: [],
                mainWorkout: [],
                cooldown: [],
            };

            (model.generateContent as jest.Mock).mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockRoutine),
                },
            });

            const result = await aiService.generateRoutine({
                studentId: 'student_1',
                goal: 'Hipertrofia',
                coachNotes: 'Test notes',
            });

            expect(result).toEqual(mockRoutine);
            expect(model.generateContent).toHaveBeenCalledTimes(1);
        });

        it('should include medical history in prompt for student with injuries', async () => {
            const mockRoutine = {
                routineName: 'Safe Routine',
                motivationalQuote: 'Safety First',
                duration: '30 min',
                medicalConsiderations: 'Avoid knee impact',
                warmup: [],
                mainWorkout: [],
                cooldown: [],
            };

            (model.generateContent as jest.Mock).mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockRoutine),
                },
            });

            await aiService.generateRoutine({
                studentId: 'student_1', // Juan Pérez with knee injury
                goal: 'Rehabilitación',
            });

            const callArgs = (model.generateContent as jest.Mock).mock.calls[0][0];
            expect(callArgs).toContain('Rodilla izquierda');
            expect(callArgs).toContain('HISTORIAL MÉDICO');
        });

        it('should handle demo user without medical history', async () => {
            const mockRoutine = {
                routineName: 'Demo Routine',
                motivationalQuote: 'Start Strong',
                duration: '40 min',
                warmup: [],
                mainWorkout: [],
                cooldown: [],
            };

            (model.generateContent as jest.Mock).mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockRoutine),
                },
            });

            const result = await aiService.generateRoutine({
                studentId: 'unknown_student',
                goal: 'Fuerza Máxima',
            });

            expect(result).toEqual(mockRoutine);
            const callArgs = (model.generateContent as jest.Mock).mock.calls[0][0];
            expect(callArgs).toContain('Alumno: Demo');
        });

        it('should include coach notes in prompt when provided', async () => {
            const mockRoutine = {
                routineName: 'Custom Routine',
                motivationalQuote: 'Push Harder',
                duration: '50 min',
                warmup: [],
                mainWorkout: [],
                cooldown: [],
            };

            (model.generateContent as jest.Mock).mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockRoutine),
                },
            });

            const coachNotes = 'Focus on upper body, avoid lower body';

            await aiService.generateRoutine({
                studentId: 'student_2',
                goal: 'Hipertrofia',
                coachNotes,
            });

            const callArgs = (model.generateContent as jest.Mock).mock.calls[0][0];
            expect(callArgs).toContain(coachNotes);
        });

        it('should throw error if Gemini API fails', async () => {
            (model.generateContent as jest.Mock).mockRejectedValue(
                new Error('API Error')
            );

            await expect(
                aiService.generateRoutine({
                    studentId: 'student_1',
                    goal: 'Hipertrofia',
                })
            ).rejects.toThrow('API Error');
        });

        it('should throw error if response is not valid JSON', async () => {
            (model.generateContent as jest.Mock).mockResolvedValue({
                response: {
                    text: () => 'Invalid JSON',
                },
            });

            await expect(
                aiService.generateRoutine({
                    studentId: 'student_1',
                    goal: 'Hipertrofia',
                })
            ).rejects.toThrow();
        });
    });

    describe('getStudentContext (private method testing via generateRoutine)', () => {
        it('should extract correct student data for student_1', async () => {
            const mockRoutine = {
                routineName: 'Test',
                motivationalQuote: 'Test',
                duration: '30 min',
                warmup: [],
                mainWorkout: [],
                cooldown: [],
            };

            (model.generateContent as jest.Mock).mockResolvedValue({
                response: {
                    text: () => JSON.stringify(mockRoutine),
                },
            });

            await aiService.generateRoutine({
                studentId: 'student_1',
                goal: 'Hipertrofia',
            });

            const callArgs = (model.generateContent as jest.Mock).mock.calls[0][0];
            expect(callArgs).toContain('Juan Pérez');
            expect(callArgs).toContain('28 años');
            expect(callArgs).toContain('75 kg');
            expect(callArgs).toContain('Intermedio');
        });
    });
});
