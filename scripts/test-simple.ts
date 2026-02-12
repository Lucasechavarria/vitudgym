import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = 'https://emjaqsvsazandttrmhol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtamFxc3ZzYXphbmR0dHJtaG9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQxMTY5OCwiZXhwIjoyMDgwOTg3Njk4fQ.FVVxFjgNGiLXHM3VDkrIbLCqeXQ2ZlOwsj84EDZvNhs';

const supabase = createClient(supabaseUrl, supabaseKey);
const log: string[] = [];

function addLog(msg: string) {
    console.log(msg);
    log.push(msg);
}

async function testConnection() {
    addLog('=== SUPABASE CONNECTION TEST ===');
    addLog('');
    addLog('URL: ' + supabaseUrl);
    addLog('Key present: ' + (supabaseKey ? 'YES' : 'NO'));
    addLog('');

    try {
        addLog('[TEST 1] Counting rows in campanas_marketing...');
        const { count, error } = await supabase
            .from('campanas_marketing')
            .select('*', { count: 'exact', head: true });

        if (error) {
            addLog('ERROR: ' + error.message);
            addLog('ERROR CODE: ' + error.code);
            addLog('ERROR DETAILS: ' + JSON.stringify(error, null, 2));
            fs.writeFileSync('test-result.txt', log.join('\n'));
            process.exit(1);
        }

        addLog('SUCCESS! Table has ' + count + ' rows');
        addLog('');

        addLog('[TEST 2] Creating test campaign...');
        const { data, error: insertError } = await supabase
            .from('campanas_marketing')
            .insert({
                nombre: 'Test Campaign ' + Date.now(),
                tipo: 'recordatorio_pago',
                mensaje_titulo: 'Test',
                mensaje_cuerpo: 'Test body',
                segmento: {},
                estado: 'activa'
            })
            .select()
            .single();

        if (insertError) {
            addLog('INSERT ERROR: ' + insertError.message);
            addLog('ERROR CODE: ' + insertError.code);
            fs.writeFileSync('test-result.txt', log.join('\n'));
            process.exit(1);
        }

        addLog('SUCCESS! Campaign created with ID: ' + data.id);
        addLog('');

        addLog('[TEST 3] Deleting test campaign...');
        const { error: deleteError } = await supabase
            .from('campanas_marketing')
            .delete()
            .eq('id', data.id);

        if (deleteError) {
            addLog('DELETE ERROR: ' + deleteError.message);
            fs.writeFileSync('test-result.txt', log.join('\n'));
            process.exit(1);
        }

        addLog('SUCCESS! Cleanup complete');
        addLog('');
        addLog('=== ALL TESTS PASSED ===');
        addLog('Marketing system is working correctly!');

        fs.writeFileSync('test-result.txt', log.join('\n'));

    } catch (err: any) {
        addLog('UNEXPECTED ERROR: ' + err.message);
        addLog('STACK: ' + err.stack);
        fs.writeFileSync('test-result.txt', log.join('\n'));
        process.exit(1);
    }
}

testConnection();
