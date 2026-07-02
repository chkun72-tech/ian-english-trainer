#!/usr/bin/env node
// One-off helper: generates simple color-block PNG icons for the PWA
// manifest / iOS home screen, with no external image libraries.
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ICONS_DIR = path.join(__dirname, '..', 'icons');

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Draws a solid background with a centered lighter square block (no text,
// no font rendering needed) — deliberately simple placeholder art.
function buildImage(size, bg, fg) {
  const raw = Buffer.alloc(size * (1 + size * 3));
  const inset = Math.round(size * 0.28);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 3);
    raw[rowStart] = 0; // filter type: none
    const inBlock = y >= inset && y < size - inset;
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;
      const useFg = inBlock && x >= inset && x < size - inset;
      const [r, g, b] = useFg ? fg : bg;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const BG = [0x1d, 0x4e, 0x89]; // deep blue
const FG = [0xf5, 0xf7, 0xfa]; // near-white block

fs.mkdirSync(ICONS_DIR, { recursive: true });
for (const size of [180, 192, 512]) {
  const buf = buildImage(size, BG, FG);
  const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
  fs.writeFileSync(path.join(ICONS_DIR, filename), buf);
  console.log(`寫入 ${filename} (${size}x${size})`);
}
