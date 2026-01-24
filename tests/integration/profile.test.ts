import { createClient } from '@supabase/supabase-js';
import { ContactoEmergenciaSchema } from '../../src/lib/validations/profile';

// Mock Supabase client for example purposes
// In a real environment, load meaningful env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key';
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Profile Integration Tests', () => {
    let testUserId: string;

    beforeAll(async () => {
        // Setup: Create a test user if possible or use a known ID
        // testUserId = ...
    });

    afterAll(async () => {
        // Cleanup
    });

    test('should validate emergency contact using Zod schema', () => {
        const validContact = {
            nombre: 'Juan Perez',
            telefono: '123456789',
            parentesco: 'Padre'
        };

        const result = ContactoEmergenciaSchema.safeParse(validContact);
        expect(result.success).toBe(true);
    });

    test('should reject invalid emergency contact', () => {
        const invalidContact = {
            nombre: '', // Empty name
            telefono: '123', // Too short
            // Missing parentesco
        };

        const result = ContactoEmergenciaSchema.safeParse(invalidContact);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.length).toBeGreaterThan(0);
        }
    });

    // Integration test with DB (skipped if no env vars)
    test.skip('should update profile with valid data', async () => {
        if (!testUserId) return;

        const contact = {
            nombre: 'Maria Gomez',
            telefono: '987654321',
            parentesco: 'Madre'
        };

        const { data, error } = await supabase
            .from('perfiles')
            .update({ contacto_emergencia: contact })
            .eq('id', testUserId)
            .select();

        expect(error).toBeNull();
        expect(data).toHaveLength(1);
        expect(data[0].contacto_emergencia).toMatchObject(contact);
    });
});
