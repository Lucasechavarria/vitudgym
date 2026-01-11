const fs = require('fs');
const path = require('path');

async function inspectProfiles() {
    console.log('🧐 Inspeccionando Perfiles...');
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
    const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

    try {
        const res = await fetch(`${url}/rest/v1/profiles?select=*&limit=5`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        const data = await res.json();
        console.log('👥 Muestra de perfiles:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

inspectProfiles();
