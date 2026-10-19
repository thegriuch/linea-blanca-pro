/**
 * Comprime las guías visuales animadas para que la OTA sea descargable.
 *
 * Los GIFs originales suman ~125 MB (uno solo pesa 61 MB): expo-updates
 * descarta en silencio una actualización cuyo payload no logra descargar,
 * y por eso los teléfonos instalados nunca reciben el fix de las guías.
 *
 * Convierte los archivos grandes a WebP animado (soportado por expo-image
 * en Android/iOS/Web) con ancho máximo 640 px y calidad 55, preservando
 * todos los frames y su velocidad original. Actualiza gifs.ts para
 * apuntar a los archivos convertidos.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.resolve(__dirname, '..', 'assets', 'images', 'gifs');
const GIFS_TS = path.resolve(__dirname, '..', 'constants', 'gifs.ts');
const MAX_WIDTH = 640;
const QUALITY = 55;
// Comprimir solo los que pesen más de 1 MB
const UMBRAL = 1024 * 1024;

async function main() {
  const registros = fs.readdirSync(DIR);
  console.log('Archivos originales:');
  for (const f of registros) {
    const kb = (fs.statSync(path.join(DIR, f)).size / 1024).toFixed(0);
    console.log(`  ${f.padEnd(42)} ${kb} KB`);
  }

  const respaldo = path.join(DIR, '_originales');
  if (!fs.existsSync(respaldo)) fs.mkdirSync(respaldo);

  const moverOriginal = (f, ruta, intentos = 4) => {
    const dest = path.join(respaldo, f);
    if (fs.existsSync(dest)) { try { fs.rmSync(ruta, { force: true }); } catch (_) {} return; }
    try { fs.copyFileSync(ruta, dest); } catch (e) { console.log(`  ⚠ no se pudo respaldar ${f}: ${e.code}`); return; }
    for (let i = 0; i < intentos; i++) {
      try { fs.rmSync(ruta, { force: true }); return; }
      catch (e) { if (i === intentos - 1) console.log(`  ⚠ ${f} bloqueado (EBUSY); reintentar la limpieza después`); else Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 800); }
    }
  };

  const pendientes = [];
  for (const f of registros) {
    const ruta = path.join(DIR, f);
    if (!fs.existsSync(ruta)) continue;
    const tam = fs.statSync(ruta).size;
    const ext = path.extname(f).toLowerCase();
    if (tam <= UMBRAL || (ext !== '.gif' && ext !== '.png')) continue;
    const base = path.basename(f, ext);
    const destino = path.join(DIR, `${base}.webp`);
    if (fs.existsSync(destino)) { console.log(`${base}.webp ya existe — solo muevo el original`); moverOriginal(f, ruta); continue; }
    console.log(`\nComprimiendo ${f} (${(tam / 1024 / 1024).toFixed(1)} MB) → ${base}.webp …`);
    await sharp(ruta, { animated: true }).resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 4 }).toFile(destino);
    console.log(`  → ${(fs.statSync(destino).size / 1024).toFixed(0)} KB`);
    moverOriginal(f, ruta);
    pendientes.push(f);
  }
  if (pendientes.length === 0) console.log('\n(los archivos grandes ya estaban convertidos)');

  // Actualizar gifs.ts: reescribir requires de .gif/.png grandes hacia .webp
  let ts = fs.readFileSync(GIFS_TS, 'utf8');
  const originales = fs.readdirSync(path.join(DIR, '_originales'));
  for (const f of originales) {
    const base = path.basename(f, path.extname(f));
    const de = new RegExp(`@/assets/images/gifs/${base}\\.(gif|png)`, 'g');
    ts = ts.replace(de, `@/assets/images/gifs/${base}.webp`);
  }
  fs.writeFileSync(GIFS_TS, ts);
  console.log('\ngifs.ts actualizado a las versiones .webp');
  console.log('Originales respaldados en assets/images/gifs/_originales/ (fuera del bundle)');
}

main().catch((e) => { console.error(e); process.exit(1); });
