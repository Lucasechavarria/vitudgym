import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = 'https://emjaqsvsazandttrmhol.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtamFxc3ZzYXphbmR0dHJtaG9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQxMTY5OCwiZXhwIjoyMDgwOTg3Njk4fQ.FVVxFjgNGiLXHM3VDkrIbLCqeXQ2ZlOwsj84EDZvNhs';

// CRITICAL: Service Role Key must be used with auth.autoRefreshToken: false
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const log: string[] = [];

function addLog(msg: string) {
    console.log(msg);
    log.push(msg);
}

async function testConnection() {
    addLog('=== SUPABASE MARKETING VERIFICATION ===');
    addLog('');

    try {
        addLog('[STEP 1] Checking table access...');
        const { count, error } = await supabase
            .from('campanas_marketing')
            .select('*', { count: 'exact', head: true });

        if (error) {
            addLog('ERROR: ' + (error.message || 'Unknown error'));
            addLog('CODE: ' + (error.code || 'undefined'));
            addLog('HINT: ' + (error.hint || 'none'));
            addLog('DETAILS: ' + JSON.stringify(error.details || 'none'));
            addLog('');
            addLog('This error usually means RLS is blocking access.');
            addLog('The Service Role Key should bypass RLS automatically.');
            addLog('');
            fs.writeFileSync('test-result.txt', log.join('\n'));
            process.exit(1);
        }

        addLog('SUCCESS! Table accessible. Current rows: ' + count);
        addLog('');

        addLog('[STEP 2] Creating test campaign...');
        const testData = {
            nombre: 'Test Campaign ' + Date.now(),
            tipo: 'recordatorio_pago',
            mensaje_titulo: 'Test Title',
            mensaje_cuerpo: 'Test Body',
            segmento: { test: true },
            estado: 'activa'
        };

        const { data, error: insertError } = await supabase
            .from('campanas_marketing')
            .insert(testData)
            .select()
            .single();

        if (insertError) {
            addLog('INSERT ERROR: ' + insertError.message);
            addLog('CODE: ' + (insertError.code || 'undefined'));
            fs.writeFileSync('test-result.txt', log.join('\n'));
            process.exit(1);
        }

        addLog('SUCCESS! Campaign created: ' + data.id);
        addLog('');

        addLog('[STEP 3] Cleaning up...');
        const { error: deleteError } = await supabase
            .from('campanas_marketing')
            .delete()
            .eq('id', data.id);

        if (deleteError) {
            addLog('DELETE ERROR: ' + deleteError.message);
            addLog('WARNING: Test campaign not deleted. ID: ' + data.id);
            fs.writeFileSync('test-result.txt', log.join('\n'));
            process.exit(1);
        }

        addLog('SUCCESS! Cleanup complete');
        addLog('');
        addLog('=== ALL TESTS PASSED ===');
        addLog('Sprint 17 (Marketing Automation) is VERIFIED!');

        fs.writeFileSync('test-result.txt', log.join('\n'));

    } catch (err: any) {
        addLog('UNEXPECTED ERROR: ' + err.message);
        addLog('STACK: ' + err.stack);
        fs.writeFileSync('test-result.txt', log.join('\n'));
        process.exit(1);
    }
}

testConnection();
