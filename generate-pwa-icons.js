const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputImage = path.join(__dirname, 'public', 'logos', 'Virtud_page-0002.webp');
const outputDir = path.join(__dirname, 'public', 'icons');

// Asegurar que el directorio de salida existe
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [192, 512];

async function generateIcons() {
    try {
        if (!fs.existsSync(inputImage)) {
            console.error(`Error: No se encontró el logo en ${inputImage}`);
            return;
        }

        for (const size of sizes) {
            const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
            await sharp(inputImage)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 } // Fondo transparente
                })
                .png()
                .toFile(outputPath);
            console.log(`✓ Generado: ${outputPath}`);
        }
        console.log('✨ Todos los iconos PWA generados con éxito.');
    } catch (error) {
        console.error('❌ Error generando los iconos:', error);
    }
}

generateIcons();
