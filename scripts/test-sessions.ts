
import fs from 'fs';
import path from 'path';

// Load .env.local manually
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2 && !line.startsWith('#')) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '');
                process.env[key] = value;
            }
        });
        console.log('✅ Loaded .env.local');
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            console.log('🔗 URL: ' + process.env.NEXT_PUBLIC_SUPABASE_URL);
        }
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.log('🔑 SUPABASE_SERVICE_ROLE_KEY found (Length: ' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')');
            try {
                const parts = process.env.SUPABASE_SERVICE_ROLE_KEY.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    console.log('🕵️ Key Role Check:', payload.role);
                    fs.writeFileSync('debug_role.log', `Role: ${payload.role}\nKeyLength: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length}`);
                    if (payload.role !== 'service_role') {
                        console.error('🚨 CRITICAL: The key in SUPABASE_SERVICE_ROLE_KEY is NOT a service_role key! It is: ' + payload.role);
                    }
                }
            } catch (e) { console.error('Error checking key role', e); }
        } else {
            console.error('❌ SUPABASE_SERVICE_ROLE_KEY NOT FOUND in .env.local');
        }
    } else {
        console.warn('⚠️ .env.local not found');
    }
} catch (e) {
    console.error('Error loading .env.local:', e);
}

import { createAdminClient } from '@/lib/supabase/admin';
import { SessionsService } from '@/services/sessions.service';

async function testSessions() {
    const studentId = '351578e5-5cdc-414c-84e3-ac256b9172d6'; // ID from user log
    console.log(`Testing getUserSessionHistory for student ${studentId}...`);

    try {
        const adminClient = createAdminClient();

        console.log('🧪 Testing simple SELECT on workout_sessions...');
        const simple = await adminClient.from('workout_sessions').select('count', { count: 'exact', head: true });
        if (simple.error) {
            console.error('❌ Simple SELECT failed:', simple.error);
        } else {
            console.log('✅ Simple SELECT success! Count:', simple.count);
        }

        const result = await SessionsService.getUserSessionHistory(studentId, 5, adminClient);

        if (result.error) {
            console.error('❌ Service Error:', result.error);
            fs.writeFileSync('debug_error.log', JSON.stringify(result.error, null, 2));
        } else {
            console.log('✅ Success! Sessions found:', result.sessions?.length);
            console.log(JSON.stringify(result.sessions, null, 2));
        }
    } catch (e) {
        console.error('❌ Unexpected Error:', e);
    }
}

testSessions();
