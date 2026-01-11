const fs = require('fs');
const path = require('path');

async function debugProduction() {
    console.log('🕵️ Diagnóstico de Producción...');
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
    const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

    const checkTable = async (name) => {
        try {
            const res = await fetch(`${url}/rest/v1/${name}?select=*&limit=1`, {
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });
            if (res.ok) {
                const data = await res.json();
                console.log(`✅ [${name}] Existe. Datos:`, data.length > 0 ? 'Encontrados' : 'Vacía');
                return true;
            } else {
                console.error(`❌ [${name}] Error ${res.status}:`, await res.text());
                return false;
            }
        } catch (e) {
            console.error(`❌ [${name}] Fallo FATAL:`, e.message);
            return false;
        }
    };

    console.log('--- Resumen de Tablas ---');
    await checkTable('profiles');
    await checkTable('user_goals');
    await checkTable('routines');
    await checkTable('exercises');
}

debugProduction();
