const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '../src/app');

const routes = [
    // Public / Auth
    'login/page.tsx',
    'api/auth/login/route.ts',
    'api/auth/logout/route.ts',

    // Admin
    'admin/page.tsx',
    'admin/layout.tsx',
    'admin/users/page.tsx',
    'api/auth/set-role/route.ts',

    // Coach
    'coach/page.tsx',
    'coach/layout.tsx',

    // Member / Dashboard
    'dashboard/page.tsx',
    'booking/page.tsx',
    'api/booking/route.ts',
    'access-pass/page.tsx',

    // Payments
    'api/payments/create-preference/route.ts'
];

console.log('🔍 Iniciando QA de Rutas (Static Analysis)...\n');

let errors = 0;

routes.forEach(route => {
    const fullPath = path.join(projectRoot, route);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ [OK] ${route}`);
    } else {
        console.error(`❌ [MISSING] ${route}`);
        errors++;
    }
});

console.log('\n------------------------------------------------');
if (errors === 0) {
    console.log('🎉 QA Exitoso: Todas las rutas críticas existen.');
} else {
    console.error(`⚠️ QA Fallido: Faltan ${errors} archivos.`);
    process.exit(1);
}
