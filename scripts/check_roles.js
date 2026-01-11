const fs = require('fs');
const path = require('path');

async function checkRoles() {
    console.log('📊 Analizando Roles en Producción...');
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
    const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

    try {
        const res = await fetch(`${url}/rest/v1/profiles?select=role`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        const data = await res.json();
        const counts = data.reduce((acc, p) => {
            acc[p.role] = (acc[p.role] || 0) + 1;
            return acc;
        }, {});
        console.log('📈 Conteo de Roles:', counts);
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

checkRoles();
