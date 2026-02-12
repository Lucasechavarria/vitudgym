#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const unusedImports = [
    { name: 'useRouter', from: 'next/navigation' },
    { name: 'Edit2', from: 'lucide-react' },
    { name: 'RoleManagement', from: '@/components/features/admin/RoleManagement' },
    { name: 'BulkStudentManager', from: '@/components/coach/BulkStudentManager' },
    { name: 'BarChart3', from: 'lucide-react' },
    { name: 'ChevronRight', from: 'lucide-react' },
    { name: 'ChevronLeft', from: 'lucide-react' },
    { name: 'Info', from: 'lucide-react' },
    { name: 'CalendarIcon', from: 'lucide-react' },
    { name: 'PieChart', from: 'lucide-react' },
    { name: 'LayoutDashboard', from: 'lucide-react' },
    { name: 'ArrowUpRight', from: 'lucide-react' },
    { name: 'Zap', from: 'lucide-react' },
    { name: 'Play', from: 'lucide-react' },
    { name: 'Pause', from: 'lucide-react' },
    { name: 'CorreccionesIA', from: '@/lib/validations/videos' },
    { name: 'AnimatePresence', from: 'framer-motion' },
    { name: 'AlertCircle', from: 'lucide-react' },
    { name: 'Clock', from: 'lucide-react' },
    { name: 'Camera', from: 'lucide-react' },
    { name: 'UserPlus', from: 'lucide-react' },
    { name: 'Bell', from: 'lucide-react' },
    { name: 'Calendar', from: 'lucide-react' },
    { name: 'Activity', from: 'lucide-react' },
    { name: 'Weight', from: 'lucide-react' },
    { name: 'Target', from: 'lucide-react' },
    { name: 'User', from: 'lucide-react' },
    { name: 'Save', from: 'lucide-react' },
    { name: 'waitFor', from: '@testing-library/react' },
    { name: 'Image', from: 'next/image' },
    { name: 'NextImage', from: 'next/image' },
    { name: 'ReactNode', from: 'react' },
    { name: 'supabase', from: '@/lib/supabase/client' },
    { name: 'SupabaseUserProfile', from: '@/types/user' },
    { name: 'Worker', from: 'bullmq' },
    { name: 'TRAINING_GOALS', from: '@/lib/constants/ai-templates' },
    { name: 'zodToJsonSchema', from: 'zod-to-json-schema' },
    { name: 'Routine', from: '@/types/supabase' },
    { name: 'RoutineExercise', from: '@/types/supabase' },
    { name: 'BookingUpdate', from: '@/types/supabase' },
    { name: 'WorkoutSessionState', from: '@/types/workout' },
    { name: 'ExerciseLog', from: '@/types/workout' },
    { name: 'crypto', from: 'crypto' },
    { name: 'MercadoPagoWebhookNotification', from: '@/types/payments' },
    { name: 'User', from: '@supabase/supabase-js' },
];

function removeUnusedImport(content, importName, fromModule) {
    // Check if the import is actually used
    const usageRegex = new RegExp(`[^a-zA-Z_]${importName}[^a-zA-Z_0-9]|^${importName}[^a-zA-Z_0-9]|[^a-zA-Z_]${importName}$`, 'gm');

    // Exclude the import line itself from the search
    const contentWithoutImports = content.replace(/^import.*$/gm, '');

    if (usageRegex.test(contentWithoutImports)) {
        return content; // Import is used, don't remove
    }

    // Remove single import
    let newContent = content.replace(
        new RegExp(`^import\\s+{\\s*${importName}\\s*}\\s+from\\s+['"]${fromModule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?\\s*\\n`, 'gm'),
        ''
    );

    // Remove from multi-import
    newContent = newContent.replace(
        new RegExp(`(import\\s+{[^}]*),\\s*${importName}\\s*([^}]*}\\s+from\\s+['"]${fromModule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"])`, 'gm'),
        '$1$2'
    );

    newContent = newContent.replace(
        new RegExp(`(import\\s+{)\\s*${importName}\\s*,([^}]*}\\s+from\\s+['"]${fromModule.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"])`, 'gm'),
        '$1$2'
    );

    return newContent;
}

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    unusedImports.forEach(({ name, from }) => {
        const newContent = removeUnusedImport(content, name, from);
        if (newContent !== content) {
            content = newContent;
            changed = true;
        }
    });

    // Fix unused error variables
    const errorFixes = [
        { pattern: /catch\s*\(\s*error\s*\)\s*{([^}]*(?!error)[^}]*)}/g, check: (match) => !match.includes('error.') && !match.includes('error)') && !match.includes('error,') },
        { pattern: /catch\s*\(\s*err\s*\)\s*{([^}]*(?!err)[^}]*)}/g, check: (match) => !match.includes('err.') && !match.includes('err)') && !match.includes('err,') },
    ];

    errorFixes.forEach(({ pattern, check }) => {
        content = content.replace(pattern, (match) => {
            if (check(match)) {
                return match.replace(/catch\s*\(\s*(error|err)\s*\)/, 'catch (_$1)');
            }
            return match;
        });
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
        return 1;
    }

    return 0;
}

function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules') {
                walkDir(filePath, callback);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            callback(filePath);
        }
    });
}

const srcDir = path.join(process.cwd(), 'src');
let totalFixes = 0;

console.log('🔧 Removing unused imports...\n');
walkDir(srcDir, (filePath) => {
    totalFixes += fixFile(filePath);
});

console.log(`\n✨ Fixed ${totalFixes} files`);
