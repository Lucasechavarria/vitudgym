// Script para verificar variables de entorno de Supabase
console.log('🔍 Verificando variables de entorno de Supabase...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ NO configurada');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ NO configurada');

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ ERROR: Faltan variables de entorno de Supabase\n');
    console.log('📝 Para configurarlas:');
    console.log('1. Crea o edita el archivo .env.local en la raíz del proyecto frontend');
    console.log('2. Agrega las siguientes líneas:\n');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui\n');
    console.log('3. Reinicia el servidor de desarrollo (npm run dev)\n');
    console.log('🔗 Encuentra estos valores en: https://supabase.com/dashboard/project/_/settings/api\n');
    process.exit(1);
} else {
    console.log('\n✅ Todas las variables de entorno están configuradas correctamente');
    console.log('\nURL:', supabaseUrl);
    console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
}
