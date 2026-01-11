const fs = require('fs');
const path = require('path');

async function testQuery() {
    console.log('🔍 Probando CONSULTA EXACTA de alumnos...');

    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
    const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

    // Simular el select complejo
    const select = `
        id,
        email,
        full_name,
        avatar_url,
        role,
        active_goal:user_goals(
            id,
            primary_goal,
            is_active
        ),
        active_routine:routines(
            id,
            name,
            is_active
        )
    `;

    const queryUrl = `${url}/rest/v1/profiles?select=${encodeURIComponent(select)}&role=or(role.eq.member,role.eq.user)&order=full_name.asc`;

    try {
        const response = await fetch(queryUrl, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Consulta exitosa.');
            console.log('👥 Alumnos:', JSON.stringify(data, null, 2));
        } else {
            console.error(`❌ Error (Status ${response.status}):`, await response.text());
        }
    } catch (e) {
        console.error('❌ Error fatal:', e.message);
    }
}

testQuery();
