const fs = require('fs');
const path = require('path');

async function verifyAllTables() {
    console.log('🧪 Verificando accesibilidad de tablas...');

    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
    const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

    const tables = ['profiles', 'user_goals', 'routines'];

    for (const table of tables) {
        try {
            const res = await fetch(`${url}/rest/v1/${table}?select=count`, {
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Range': '0-0' }
            });
            if (res.ok) {
                const count = await res.json();
                console.log(`✅ Tabla '${table}': ${JSON.stringify(count)} registros.`);
            } else {
                console.error(`❌ Tabla '${table}' error:`, await res.text());
            }
        } catch (e) {
            console.error(`❌ Fallo en '${table}':`, e.message);
        }
    }
}

verifyAllTables();
