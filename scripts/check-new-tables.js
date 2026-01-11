
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Faltan variables de entorno de Supabase.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Verificando tablas...');

    // Verificar workout_sessions
    const { error: sessionsError } = await supabase
        .from('workout_sessions')
        .select('id')
        .limit(1);

    if (sessionsError) {
        console.log('❌ Error o tabla workout_sessions no existe:', sessionsError.message);
    } else {
        console.log('✅ Tabla workout_sessions detectada.');
    }

    // Verificar exercise_performance_logs
    const { error: logsError } = await supabase
        .from('exercise_performance_logs')
        .select('id')
        .limit(1);

    if (logsError) {
        console.log('❌ Error o tabla exercise_performance_logs no existe:', logsError.message);
    } else {
        console.log('✅ Tabla exercise_performance_logs detectada.');
    }
}

checkTables();
