import { createClient } from '@supabase/supabase-js';

// Hardcoded from your .env.local
const supabaseUrl = 'https://emjaqsvsazandttrmhol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtamFxc3ZzYXphbmR0dHJtaG9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQxMTY5OCwiZXhwIjoyMDgwOTg3Njk4fQ.FVVxFjgNGiLXHM3VDkrIbLCqeXQ2ZlOwsj84EDZvNhs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔍 Testing Supabase Connection...\n');

    try {
        // Test 1: Simple count
        console.log('Test 1: Counting rows in campanas_marketing...');
        const { count, error } = await supabase
            .from('campanas_marketing')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Error:', error.message);
            console.error('Details:', error);
            return;
        }

        console.log(`✅ Success! Table has ${count} rows\n`);

        // Test 2: Insert a test campaign
        console.log('Test 2: Creating test campaign...');
        const { data, error: insertError } = await supabase
            .from('campanas_marketing')
            .insert({
                nombre: 'Test Campaign',
                tipo: 'recordatorio_pago',
                mensaje_titulo: 'Test',
                mensaje_cuerpo: 'Test body',
                segmento: {},
                estado: 'activa'
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Insert Error:', insertError.message);
            console.error('Details:', insertError);
            return;
        }

        console.log('✅ Campaign created:', data.id);

        // Test 3: Clean up
        console.log('\nTest 3: Cleaning up...');
        const { error: deleteError } = await supabase
            .from('campanas_marketing')
            .delete()
            .eq('id', data.id);

        if (deleteError) {
            console.error('❌ Delete Error:', deleteError.message);
            return;
        }

        console.log('✅ Cleanup successful\n');
        console.log('🎉 ALL TESTS PASSED! Marketing system is working correctly.');

    } catch (err: any) {
        console.error('❌ Unexpected error:', err.message);
        console.error('Stack:', err.stack);
    }
}

testConnection();
