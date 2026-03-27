// Script para convertir HTML a PNG usando Puppeteer
// Uso: node convert-to-png.js

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const files = [
  { html: 'gallery-1-hero.html', output: 'gallery-1.png', width: 1270, height: 760 },
  { html: 'gallery-2-how-it-works.html', output: 'gallery-2.png', width: 1270, height: 760 },
  { html: 'gallery-3-social-proof.html', output: 'gallery-3.png', width: 1270, height: 760 }
];

async function convertHTMLToPNG(file) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const htmlPath = path.join(__dirname, file.html);
  const outputPath = path.join(__dirname, file.output);
  
  await page.setViewport({ width: file.width, height: file.height });
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  
  await page.screenshot({
    path: outputPath,
    clip: { x: 0, y: 0, width: file.width, height: file.height }
  });
  
  await browser.close();
  console.log(`✅ ${file.output} generado`);
}

async function main() {
  console.log('Generando imágenes para Product Hunt...\n');
  
  for (const file of files) {
    await convertHTMLToPNG(file);
  }
  
  console.log('\n🎉 Todas las imágenes listas!');
  console.log('Ahora convertí el logo.svg a PNG usando:');
  console.log('- https://cloudconvert.com/svg-to-png (240x240px)');
  console.log('- O abrilo en Chrome, hacer zoom 200%, screenshot\n');
}

main().catch(console.error);
