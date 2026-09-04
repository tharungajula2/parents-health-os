const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG Encoder in pure Node.js using built-in zlib module
function createPng(width, height, getPixel) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);  // Bit depth 8
  ihdrData.writeUInt8(6, 9);  // RGBA color type (6)
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT raw scanlines (1 filter byte 0 + RGBA bytes per row)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const typeBuf = Buffer.from(type, 'ascii');
  const buf = Buffer.alloc(4 + 4 + length + 4);

  buf.writeUInt32BE(length, 0);
  typeBuf.copy(buf, 4);
  data.copy(buf, 8);

  const crcData = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcData);
  buf.writeUInt32BE(crc, 8 + length);

  return buf;
}

// CRC32 implementation for PNG chunks
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Parents Health OS Icon Generator (#0E5E5A Teal, #FAF9F6 Cream, #E05E1B Orange)
function getBrandPixel(x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;

  // Squircle background check
  const dx = Math.abs(x - cx);
  const dy = Math.abs(y - cy);
  const squircle = Math.pow(dx / (radius * 0.95), 4) + Math.pow(dy / (radius * 0.95), 4);

  if (squircle > 1.0) {
    return [0, 0, 0, 0]; // Transparent outside squircle
  }

  // Cross / Heart Health Symbol Geometry
  const thickness = width * 0.12;
  const armLen = width * 0.28;

  const inVertArm = Math.abs(x - cx) <= thickness && Math.abs(y - cy) <= armLen;
  const inHorizArm = Math.abs(y - cy) <= thickness && Math.abs(x - cx) <= armLen;

  // Orange Accent Dot (Top Right of cross)
  const dotCx = cx + width * 0.22;
  const dotCy = cy - height * 0.22;
  const dotDistSq = (x - dotCx) * (x - dotCx) + (y - dotCy) * (y - dotCy);
  const dotRadius = width * 0.07;

  if (dotDistSq <= dotRadius * dotRadius) {
    return [0xE0, 0x5E, 0x1B, 0xFF]; // #E05E1B Warm Orange
  }

  if (inVertArm || inHorizArm) {
    return [0xFA, 0xF9, 0xF6, 0xFF]; // #FAF9F6 Off-white/Cream
  }

  return [0x0E, 0x5E, 0x5A, 0xFF]; // #0E5E5A Primary Emerald/Teal
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating 192x192 PWA Icon...');
const png192 = createPng(192, 192, getBrandPixel);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);

console.log('Generating 512x512 PWA Icon...');
const png512 = createPng(512, 512, getBrandPixel);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);

console.log('Generating Apple Touch Icon (180x180)...');
const png180 = createPng(180, 180, getBrandPixel);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), png180);

console.log('✓ All PWA brand icons generated successfully.');
