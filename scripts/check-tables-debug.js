const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // Use service role if possible to bypass RLS, but here we probably only have anon or need service role.
    // If we only have anon, we might be blocked by RLS.
    // Let's try to query.

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing supabase credentials");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Checking workout_sessions...");
    const { data, error } = await supabase.from('workout_sessions').select('*').limit(1);

    if (error) {
        console.error("Error querying workout_sessions:", error);
    } else {
        console.log("workout_sessions exists. Rows:", data.length);
    }

    console.log("Checking exercise_performance_logs...");
    const { data: logs, error: logError } = await supabase.from('exercise_performance_logs').select('*').limit(1);
    if (logError) {
        console.error("Error querying exercise_performance_logs:", logError);
    } else {
        console.log("exercise_performance_logs exists. Rows:", logs?.length);
    }
}

checkTables();
