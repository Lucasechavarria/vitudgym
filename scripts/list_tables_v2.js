const fs = require('fs');
const path = require('path');

async function listTables() {
    console.log('📋 Listando todas las tablas en Supabase...');
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
    const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

    try {
        const res = await fetch(`${url}/rest/v1/`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        if (res.ok) {
            const data = await res.json();
            const tableNames = Object.keys(data.definitions || {});
            console.log('✅ Tablas en schema cache:', tableNames);
        } else {
            console.error('❌ Error:', await res.text());
        }
    } catch (e) {
        console.error('❌ Fallo:', e.message);
    }
}

listTables();
