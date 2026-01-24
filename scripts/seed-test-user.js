const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
    console.error('.env.local not found at', envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    // Basic parser that handles ignoring comments and empty lines
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
        let value = match[2];
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        env[match[1]] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env.local');
    console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('Key:', serviceRoleKey ? 'Found' : 'Missing');
    process.exit(1);
}

// 2. Init Supabase Admin Client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seedUser() {
    // Usamos un email alternativo para evitar conflictos con cuentas corruptas
    const email = 'coach_cypress@virtudgym.com';
    const password = 'password123';

    console.log(`\n🔍 Checking user: ${email}`);

    // Try to create the user
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            nombre_completo: 'Entrenador Test',
            nombre: 'Entrenador',
            apellido: 'Test'
        }
    });

    let userId;

    if (createError) {
        // If user already exists, find their ID
        if (createError.message.includes('already registered') || createError.status === 422) {
            console.log('   User already exists. Updating password...');

            // List users to find the ID (limit to 1000 should be enough for dev)
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

            if (listError) {
                console.error('   ❌ Error listing users:', listError);
                return;
            }

            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                userId = existingUser.id;
                // Update password to ensure test passes
                const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { password });
                if (updateError) {
                    console.error('   ❌ Error updating password:', updateError);
                } else {
                    console.log('   ✅ Password updated successfully.');
                }
            } else {
                console.error('   ❌ Could not find user in list even though create failed.');
                return;
            }
        } else {
            console.error('   ❌ Error creating user:', createError);
            return;
        }
    } else {
        userId = createData.user.id;
        console.log(`   ✅ User created successfully (ID: ${userId})`);
    }

    // 3. Update Profile Role
    if (userId) {
        console.log('🔄 Ensuring profile role is "coach"...');
        const { error: profileError } = await supabase.from('perfiles').upsert({
            id: userId,
            email: email,
            rol: 'coach',
            nombre_completo: 'Entrenador Test',
            nombre: 'Entrenador',
            apellido: 'Test',
            updated_at: new Date().toISOString()
        });

        if (profileError) {
            console.error('   ❌ Error updating profile:', profileError);
        } else {
            console.log('   ✅ Profile updated successfully.');
        }
    }

    console.log('\n✨ Seed completed.\n');
}

seedUser();
