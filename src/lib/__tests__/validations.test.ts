import { validateEmail, validatePassword, validatePhone, validateAge, validateWeight, validateHeight } from '../validations';

describe('Validations', () => {
    describe('validateEmail', () => {
        it('should validate correct email', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
        });

        it('should reject invalid email', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('missing@domain')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should validate strong password', () => {
            const result = validatePassword('StrongPass123!');
            expect(result.isValid).toBe(true);
            expect(result.strength).toBe('strong');
            expect(result.errors).toHaveLength(0);
        });

        it('should validate medium password', () => {
            const result = validatePassword('GoodPass1');
            expect(result.isValid).toBe(true);
            expect(result.strength).toBe('medium');
        });

        it('should reject weak password', () => {
            const result = validatePassword('weak');
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should reject password without uppercase', () => {
            const result = validatePassword('password123');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Debe contener mayúsculas');
        });

        it('should reject password without numbers', () => {
            const result = validatePassword('Password');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Debe contener números');
        });

        it('should reject short password', () => {
            const result = validatePassword('Pass1');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Mínimo 8 caracteres');
        });
    });

    describe('validatePhone', () => {
        it('should validate correct phone numbers', () => {
            expect(validatePhone('+541234567890')).toBe(true);
            expect(validatePhone('1234567890')).toBe(true);
            expect(validatePhone('+1 234 567 8900')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(validatePhone('123')).toBe(false);
            expect(validatePhone('abc123')).toBe(false);
            expect(validatePhone('+0123')).toBe(false);
        });
    });

    describe('validateAge', () => {
        it('should validate valid age', () => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 25);
            const result = validateAge(date.toISOString().split('T')[0]);

            expect(result.isValid).toBe(true);
            expect(result.age).toBe(25);
        });

        it('should reject age under 16', () => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 10);
            const result = validateAge(date.toISOString().split('T')[0]);

            expect(result.isValid).toBe(false);
        });

        it('should reject age over 100', () => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - 110);
            const result = validateAge(date.toISOString().split('T')[0]);

            expect(result.isValid).toBe(false);
        });
    });

    describe('validateWeight', () => {
        it('should validate correct weight', () => {
            expect(validateWeight(70)).toBe(true);
            expect(validateWeight(50)).toBe(true);
            expect(validateWeight(150)).toBe(true);
        });

        it('should reject invalid weight', () => {
            expect(validateWeight(0)).toBe(false);
            expect(validateWeight(-10)).toBe(false);
            expect(validateWeight(350)).toBe(false);
        });
    });

    describe('validateHeight', () => {
        it('should validate correct height', () => {
            expect(validateHeight(175)).toBe(true);
            expect(validateHeight(150)).toBe(true);
            expect(validateHeight(200)).toBe(true);
        });

        it('should reject invalid height', () => {
            expect(validateHeight(0)).toBe(false);
            expect(validateHeight(-10)).toBe(false);
            expect(validateHeight(300)).toBe(false);
        });
    });
});
