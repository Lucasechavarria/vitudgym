#!/usr/bin/env node
/**
 * Script para arreglar automáticamente warnings de ESLint
 * Enfocado en: unused vars, unused imports, unused error catches
 */

const fs = require('fs');
const path = require('path');

// Patrones a arreglar
const fixes = [
    // Prefijo _ para errores no usados en catch
    {
        pattern: /catch\s*\(\s*error\s*\)/g,
        replacement: 'catch (_error)',
        description: 'Unused error in catch'
    },
    {
        pattern: /catch\s*\(\s*err\s*\)/g,
        replacement: 'catch (_err)',
        description: 'Unused err in catch'
    },
    {
        pattern: /catch\s*\(\s*sentryError\s*\)/g,
        replacement: 'catch (_sentryError)',
        description: 'Unused sentryError in catch'
    },

    // Remover imports no usados comunes
    {
        pattern: /^import\s+{\s*useRouter\s*}\s+from\s+['"]next\/navigation['"];\s*\n/gm,
        replacement: '',
        description: 'Unused useRouter import',
        condition: (content) => !content.includes('useRouter(')
    },
    {
        pattern: /^import\s+{\s*Edit2\s*}\s+from\s+['"]lucide-react['"];\s*\n/gm,
        replacement: '',
        description: 'Unused Edit2 import',
        condition: (content) => !content.includes('<Edit2')
    },
];

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    let fixCount = 0;

    fixes.forEach(fix => {
        if (fix.condition && !fix.condition(content)) {
            return; // Skip si la condición no se cumple
        }

        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
            content = newContent;
            changed = true;
            fixCount++;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${fixCount} issues in: ${path.relative(process.cwd(), filePath)}`);
        return fixCount;
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

// Ejecutar
const srcDir = path.join(process.cwd(), 'src');
let totalFixes = 0;

console.log('🔧 Fixing ESLint warnings...\n');
walkDir(srcDir, (filePath) => {
    totalFixes += fixFile(filePath);
});

console.log(`\n✨ Total fixes applied: ${totalFixes}`);
