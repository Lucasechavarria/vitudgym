export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export interface PasswordValidation {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
}

export const validatePassword = (password: string): PasswordValidation => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Mínimo 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Debe contener mayúsculas');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Debe contener números');
    }

    const strength =
        password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)
            ? 'strong'
            : password.length >= 8 && (/[A-Z]/.test(password) || /[0-9]/.test(password))
                ? 'medium'
                : 'weak';

    return {
        isValid: errors.length === 0,
        strength,
        errors
    };
};

export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const validateAge = (dateOfBirth: string): { isValid: boolean; age?: number } => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return {
        isValid: age >= 16 && age <= 100,
        age
    };
};

export const validateWeight = (weight: number): boolean => {
    return weight > 0 && weight < 300;
};

export const validateHeight = (height: number): boolean => {
    return height > 0 && height < 250;
};
