/**
 * Regenera utils/letterheadIcon.ts con una copia completa y nítida del icono
 * de la app, para el membrete de los reportes DOCX.
 *
 * El archivo anterior tenía el base64 cortado (sin el bloque IEND), así que
 * Word/el visor mostraban el icono distorsionado.
 *
 * Uso: node scripts/generar-icono-membrete.cjs
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SOURCE = path.join(__dirname, '..', 'assets', 'images', 'icon.png');
const TARGET = path.join(__dirname, '..', 'utils', 'letterheadIcon.ts');
const SIZE = 256;

/** Decodifica un PNG 8 bits (paleta, gris, RGB o RGBA) a píxeles RGBA. */
function decodePng(file) {
  const b = fs.readFileSync(file);
  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let palette = null;
  const idat = [];

  while (pos < b.length) {
    const len = b.readUInt32BE(pos);
    const type = b.toString('ascii', pos + 4, pos + 8);
    const data = b.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'PLTE') {
      palette = data;
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }

  if (bitDepth !== 8) throw new Error(`Profundidad no soportada: ${bitDepth}`);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`Tipo de color no soportado: ${colorType}`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(width * height * channels);
  let prev = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const cur = Buffer.alloc(stride);
    for (let i = 0; i < stride; i += 1) {
      const a = i >= channels ? cur[i - channels] : 0;
      const up = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      const x = line[i];
      let v;
      if (filter === 0) v = x;
      else if (filter === 1) v = x + a;
      else if (filter === 2) v = x + up;
      else if (filter === 3) v = x + ((a + up) >> 1);
      else if (filter === 4) {
        const p = a + up - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - c);
        v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? up : c);
      } else throw new Error(`Filtro no soportado: ${filter}`);
      cur[i] = v & 0xff;
    }
    cur.copy(out, y * stride);
    prev = cur;
  }

  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const o = i * channels;
    let r;
    let g;
    let bl;
    let al = 255;
    if (colorType === 3) {
      const idx = out[o];
      r = palette[idx * 3];
      g = palette[idx * 3 + 1];
      bl = palette[idx * 3 + 2];
    } else if (colorType === 6) {
      [r, g, bl, al] = [out[o], out[o + 1], out[o + 2], out[o + 3]];
    } else if (colorType === 2) {
      [r, g, bl] = [out[o], out[o + 1], out[o + 2]];
    } else if (colorType === 0) {
      r = g = bl = out[o];
    } else {
      r = g = bl = out[o];
      al = out[o + 1];
    }
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = bl;
    rgba[i * 4 + 3] = al;
  }

  return { width, height, rgba };
}

/** Reduce con promedio de área (sin deformar: destino cuadrado). */
function resize(img, size) {
  const dst = Buffer.alloc(size * size * 4);
  const dx = img.width / size;
  const dy = img.height / size;
  for (let y = 0; y < size; y += 1) {
    const y0 = Math.floor(y * dy);
    const y1 = Math.min(img.height, Math.max(y0 + 1, Math.floor((y + 1) * dy)));
    for (let x = 0; x < size; x += 1) {
      const x0 = Math.floor(x * dx);
      const x1 = Math.min(img.width, Math.max(x0 + 1, Math.floor((x + 1) * dx)));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          const o = (sy * img.width + sx) * 4;
          r += img.rgba[o];
          g += img.rgba[o + 1];
          b += img.rgba[o + 2];
          a += img.rgba[o + 3];
          n += 1;
        }
      }
      const o = (y * size + x) * 4;
      dst[o] = Math.round(r / n);
      dst[o + 1] = Math.round(g / n);
      dst[o + 2] = Math.round(b / n);
      dst[o + 3] = Math.round(a / n);
    }
  }
  return dst;
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(rgba, size) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0; // sin filtro
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const source = decodePng(SOURCE);
const png = encodePng(resize(source, SIZE), SIZE);
const base64 = png.toString('base64');

const contents = `/**
 * Small bundled copy of the app icon for DOCX generation.
 *
 * Android can resolve the app icon to a drawable resource name
 * (\`assets_images_icon\`) instead of a readable file:// URI. Keeping this
 * compact copy as a data URI lets docx embed the letterhead reliably on
 * Android, iOS, and web.
 *
 * ${SIZE}x${SIZE} PNG completo (con IHDR/IDAT/IEND), generado desde
 * assets/images/icon.png por scripts/generar-icono-membrete.cjs.
 * No editar a mano: un base64 cortado hace que el icono salga distorsionado.
 */
export const LETTERHEAD_ICON_DATA_URI =
  'data:image/png;base64,${base64}';
`;

fs.writeFileSync(TARGET, contents, 'utf8');
console.log(`Icono de membrete: ${SIZE}x${SIZE}, ${png.length} bytes PNG, ${base64.length} caracteres base64.`);
