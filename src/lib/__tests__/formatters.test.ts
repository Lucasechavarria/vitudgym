import {
    formatCurrency,
    formatDate,
    formatWeight,
    formatHeight,
    formatPercentage,
    calculateAge,
    calculateBMI,
    formatDuration
} from '../formatters';

describe('Formatters', () => {
    describe('formatCurrency', () => {
        it('should format currency correctly', () => {
            expect(formatCurrency(1000)).toContain('1');
            expect(formatCurrency(1000)).toContain('000');
        });

        it('should handle decimals', () => {
            const result = formatCurrency(1234.56);
            expect(result).toContain('1');
            expect(result).toContain('234');
        });
    });

    describe('formatDate', () => {
        const testDate = new Date('2024-12-12T10:30:00');

        it('should format short date', () => {
            const result = formatDate(testDate, 'short');
            expect(result).toContain('12');
            expect(result).toContain('2024');
        });

        it('should format long date', () => {
            const result = formatDate(testDate, 'long');
            expect(result).toContain('diciembre');
            expect(result).toContain('2024');
        });

        it('should format full date with time', () => {
            const result = formatDate(testDate, 'full');
            expect(result).toContain('diciembre');
            expect(result).toContain('10');
            expect(result).toContain('30');
        });

        it('should handle string dates', () => {
            const result = formatDate('2024-12-12', 'short');
            expect(result).toContain('12');
            expect(result).toContain('2024');
        });
    });

    describe('formatWeight', () => {
        it('should format weight with one decimal', () => {
            expect(formatWeight(70)).toBe('70.0 kg');
            expect(formatWeight(75.5)).toBe('75.5 kg');
            expect(formatWeight(80.123)).toBe('80.1 kg');
        });
    });

    describe('formatHeight', () => {
        it('should format height in cm', () => {
            expect(formatHeight(175)).toBe('175 cm');
            expect(formatHeight(160)).toBe('160 cm');
        });
    });

    describe('formatPercentage', () => {
        it('should format percentage with default decimals', () => {
            expect(formatPercentage(75)).toBe('75%');
            expect(formatPercentage(50.5)).toBe('51%');
        });

        it('should format percentage with custom decimals', () => {
            expect(formatPercentage(75.456, 2)).toBe('75.46%');
            expect(formatPercentage(50.1, 1)).toBe('50.1%');
        });
    });

    describe('calculateAge', () => {
        it('should calculate age correctly', () => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 25);
            const birthDate = date.toISOString().split('T')[0];

            expect(calculateAge(birthDate)).toBe(25);
        });

        it('should handle birthdays not yet occurred this year', () => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 30);
            date.setMonth(date.getMonth() + 2); // Birthday in 2 months
            const birthDate = date.toISOString().split('T')[0];

            expect(calculateAge(birthDate)).toBe(29);
        });
    });

    describe('calculateBMI', () => {
        it('should calculate BMI correctly', () => {
            expect(calculateBMI(70, 175)).toBe('22.9');
            expect(calculateBMI(80, 180)).toBe('24.7');
            expect(calculateBMI(60, 160)).toBe('23.4');
        });

        it('should handle edge cases', () => {
            expect(calculateBMI(50, 150)).toBe('22.2');
            expect(calculateBMI(100, 200)).toBe('25.0');
        });
    });

    describe('formatDuration', () => {
        it('should format minutes only', () => {
            expect(formatDuration(30)).toBe('30 min');
            expect(formatDuration(45)).toBe('45 min');
        });

        it('should format hours and minutes', () => {
            expect(formatDuration(90)).toBe('1h 30min');
            expect(formatDuration(125)).toBe('2h 5min');
        });

        it('should format hours only', () => {
            expect(formatDuration(60)).toBe('1h');
            expect(formatDuration(120)).toBe('2h');
        });
    });
});
