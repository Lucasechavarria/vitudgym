#!/usr/bin/env node
/**
 * Script para arreglar warnings seguros de ESLint
 * Solo arregla casos muy específicos y seguros
 */

const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let changes = [];

    // 1. Fix unused 'useRouter' from next/navigation
    if (content.includes("import { useRouter } from 'next/navigation'") &&
        !content.includes('useRouter(')) {
        content = content.replace(/^import\s+{\s*useRouter\s*}\s+from\s+['"]next\/navigation['"];\s*\n/gm, '');
        changes.push('Removed unused useRouter');
    }

    // 2. Fix unused 'Edit2' from lucide-react
    if (content.includes("import { Edit2") && !content.includes('<Edit2')) {
        content = content.replace(/,\s*Edit2\s*/g, '');
        content = content.replace(/\s*Edit2\s*,/g, '');
        content = content.replace(/^import\s+{\s*Edit2\s*}\s+from\s+['"]lucide-react['"];\s*\n/gm, '');
        changes.push('Removed unused Edit2');
    }

    // 3. Fix unused 'RoleManagement' import
    if (content.includes("import { RoleManagement }") && !content.includes('<RoleManagement')) {
        content = content.replace(/^import\s+{\s*RoleManagement\s*}\s+from[^;]+;\s*\n/gm, '');
        changes.push('Removed unused RoleManagement');
    }

    // 4. Fix unused error in catch blocks (solo si NO se usa en el bloque)
    // Patrón: catch (error) { ... } donde error NO aparece en el bloque
    const catchBlocks = content.matchAll(/catch\s*\(\s*(error|err)\s*\)\s*{([^}]+)}/g);
    for (const match of catchBlocks) {
        const varName = match[1];
        const blockContent = match[2];

        // Verificar si la variable NO se usa en el bloque
        const usageRegex = new RegExp(`\\b${varName}\\b`);
        if (!usageRegex.test(blockContent)) {
            // Reemplazar solo este catch específico
            const fullMatch = match[0];
            const fixed = fullMatch.replace(`(${varName})`, `(_${varName})`);
            content = content.replace(fullMatch, fixed);
            changes.push(`Fixed unused ${varName} in catch`);
        }
    }

    // 5. Fix specific unused imports from lucide-react (solo los más comunes)
    const unusedIcons = ['BarChart3', 'ChevronRight', 'ChevronLeft', 'Info', 'PieChart', 'LayoutDashboard'];
    unusedIcons.forEach(icon => {
        // Solo remover si NO se usa en JSX
        if (content.includes(icon) && !content.includes(`<${icon}`)) {
            content = content.replace(new RegExp(`,\\s*${icon}\\s*`, 'g'), '');
            content = content.replace(new RegExp(`\\s*${icon}\\s*,`, 'g'), '');
            changes.push(`Removed unused ${icon}`);
        }
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
        changes.forEach(c => console.log(`   - ${c}`));
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

console.log('🔧 Fixing safe ESLint warnings...\n');
walkDir(srcDir, (filePath) => {
    totalFixes += fixFile(filePath);
});

console.log(`\n✨ Fixed ${totalFixes} files`);
