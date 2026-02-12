#!/usr/bin/env node
/**
 * Script agresivo para arreglar variables no usadas
 * Enfocado en casos seguros y comunes
 */

const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let changes = [];

    // 1. Fix ALL unused error/err variables in catch blocks
    // Buscar catch (error) o catch (err) y verificar si se usa
    const catchRegex = /catch\s*\(\s*(error|err|e)\s*\)\s*{([^}]+)}/g;
    let match;
    const replacements = [];

    while ((match = catchRegex.exec(content)) !== null) {
        const varName = match[1];
        const blockContent = match[2];
        const fullMatch = match[0];

        // Verificar si la variable NO se usa en el bloque
        const usageRegex = new RegExp(`\\b${varName}\\b`);
        if (!usageRegex.test(blockContent)) {
            replacements.push({
                from: fullMatch,
                to: fullMatch.replace(`(${varName})`, `(_${varName})`)
            });
            changes.push(`Fixed unused ${varName} in catch`);
        }
    }

    // Aplicar reemplazos
    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });

    // 2. Fix parámetros no usados en funciones (agregar _ al inicio)
    // Patrón: (param: Type) => donde param no se usa
    const arrowFnRegex = /\(([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*[^)]+\)\s*=>\s*{([^}]+)}/g;
    while ((match = arrowFnRegex.exec(original)) !== null) {
        const paramName = match[1];
        const bodyContent = match[2];

        // Skip si ya tiene _
        if (paramName.startsWith('_')) continue;

        // Verificar si NO se usa
        const usageRegex = new RegExp(`\\b${paramName}\\b`);
        if (!usageRegex.test(bodyContent)) {
            const fullMatch = match[0];
            const fixed = fullMatch.replace(`(${paramName}:`, `(_${paramName}:`);
            content = content.replace(fullMatch, fixed);
            changes.push(`Prefixed unused param _${paramName}`);
        }
    }

    // 3. Remover variables asignadas pero nunca usadas
    // Patrón: const variable = ... donde variable no se usa después
    const lines = content.split('\n');
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detectar: const varName = ...
        const constMatch = line.match(/^\s*const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
        if (constMatch) {
            const varName = constMatch[1];

            // Verificar si se usa en el resto del archivo
            const restOfFile = lines.slice(i + 1).join('\n');
            const usageRegex = new RegExp(`\\b${varName}\\b`);

            if (!usageRegex.test(restOfFile) && !varName.startsWith('_')) {
                // No se usa, comentar o skip
                // Solo si es una asignación simple (no destructuring)
                if (!line.includes('{') && !line.includes('[')) {
                    changes.push(`Commented unused const ${varName}`);
                    newLines.push(`// ${line.trim()} // Unused variable`);
                    continue;
                }
            }
        }

        newLines.push(line);
    }

    if (changes.length > 0) {
        content = newLines.join('\n');
    }

    // 4. Fix específicos conocidos
    // 'i' no usado en map/filter
    content = content.replace(/\.map\(\([^,)]+,\s*i\)\s*=>\s*{/g, (match) => {
        if (!match.includes('i)') || match.includes('_i')) return match;
        return match.replace(', i)', ', _i)');
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

console.log('🔧 Fixing unused variables...\n');
walkDir(srcDir, (filePath) => {
    totalFixes += fixFile(filePath);
});

console.log(`\n✨ Fixed ${totalFixes} files`);
