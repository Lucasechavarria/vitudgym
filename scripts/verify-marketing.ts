
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role for Admin/Cron Simulation

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Environment Variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMarketingSystem() {
  console.log('🚀 Starting Marketing System Verification...');

  try {
    // 1. Check Tables Existence and Count
    console.log('\n🔍 Step 1: Checking Tables...');
    
    const { count: campaignsCount, error: tableError } = await supabase
      .from('campanas_marketing')
      .select('*', { count: 'exact', head: true });

    if (tableError) {
      console.error('❌ Table check failed:', tableError.message);
      throw tableError;
    }
    console.log(`✅ Table 'campanas_marketing' exists (Rows: ${campaignsCount})`);

    // 2. Create Dummy Campaign
    console.log('\n📝 Step 2: Creating Test Campaign...');
    const testCampaign = {
      nombre: `Test Campaign ${Date.now()}`,
      tipo: 'recordatorio_pago',
      mensaje_titulo: 'Test Reminder',
      mensaje_cuerpo: 'This is a test notification.',
      segmento: { criteria: 'all_active_members' },
      fecha_inicio: new Date().toISOString(),
      estado: 'activa'
    };

    const { data: campaign, error: insertError } = await supabase
      .from('campanas_marketing')
      .insert(testCampaign)
      .select()
      .single();

    if (insertError) throw insertError;
    console.log(`✅ Test Campaign created: ${campaign.id} (${campaign.nombre})`);

    // 3. Simulate "Processing" (Creating Engagement Log)
    console.log('\n⚙️ Step 3: Simulating Engagement Log (Email Sent)...');
    
    // We need a dummy user ID. Let's try to get one or use a placeholder if dev
    const { data: users } = await supabase.from('perfiles').select('id').limit(1);
    const userId = users?.[0]?.id;

    if (!userId) {
        console.warn('⚠️ No users found in DB. Skipping engagement simulation. Please add a user first.');
    } else {
        const { error: logError } = await supabase
            .from('historial_engagement')
            .insert({
                usuario_id: userId,
                tipo_evento: 'notificacion_abierta', // Simulation of interaction
                metadatos: { campaign_id: campaign.id, channel: 'email' }
            });

        if (logError) throw logError;
        console.log(`✅ Engagement Logged for User: ${userId}`);
    }

    // 4. Clean up (Optional, but good for reliable tests)
    console.log('\n🧹 Step 4: Cleanup...');
    const { error: deleteError } = await supabase
        .from('campanas_marketing')
        .delete()
        .eq('id', campaign.id);
    
    if (deleteError) console.warn('⚠️ Cleanup failed:', deleteError.message);
    else console.log('✅ Test Campaign deleted.');

    console.log('\n🎉 MARKETING SYSTEM VERIFIED SUCCESSFULLY!');

  } catch (error: any) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

verifyMarketingSystem();
