const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height) {
  // Create raw RGBA buffer
  // Format: width * height * 4 + height (1 filter byte per scanline)
  const rowSize = 1 + width * 4;
  const buffer = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    buffer[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Draw background gradient (dark indigo/slate #1e1e2f to #12121c)
      let r = 30 + Math.floor((x / width) * 20);
      let g = 30 + Math.floor((y / height) * 30);
      let b = 55 + Math.floor(((x + y) / (width + height)) * 40);
      let a = 255;

      // Rounded rectangle border
      const radius = 32;
      const dx = Math.min(x, width - 1 - x);
      const dy = Math.min(y, height - 1 - y);
      if (dx < radius && dy < radius) {
        const dist = Math.sqrt((radius - dx) ** 2 + (radius - dy) ** 2);
        if (dist > radius) {
          a = 0; // Transparent outside corner
        }
      }

      // Draw route / node network
      // Node 1: (64, 192), Node 2: (192, 128), Node 3: (128, 64)
      const d1 = Math.sqrt((x - 70) ** 2 + (y - 180) ** 2);
      const d2 = Math.sqrt((x - 185) ** 2 + (y - 128) ** 2);
      const d3 = Math.sqrt((x - 90) ** 2 + (y - 75) ** 2);

      // Connecting lines
      // Line from Node 1 to Node 2: y - 180 = ((128-180)/(185-70)) * (x - 70) => y - 180 = -0.45 * (x - 70)
      const distLine1 = Math.abs((128 - 180) * x - (185 - 70) * y + 185 * 180 - 70 * 128) / Math.sqrt((128 - 180) ** 2 + (185 - 70) ** 2);
      if (distLine1 < 5 && x >= 70 && x <= 185) {
        r = 50; g = 180; b = 255;
      }

      // Line from Node 3 to Node 2
      const distLine2 = Math.abs((128 - 75) * x - (185 - 90) * y + 185 * 75 - 90 * 128) / Math.sqrt((128 - 75) ** 2 + (185 - 90) ** 2);
      if (distLine2 < 5 && x >= 90 && x <= 185) {
        r = 78; g = 201; b = 176; // Teal checkmark color
      }

      // Draw node circles
      if (d1 < 18) {
        // Cyan route start
        r = 0; g = 160; b = 240;
      } else if (d1 < 22) {
        r = 255; g = 255; b = 255;
      }

      if (d2 < 22) {
        // Green success node
        r = 78; g = 201; b = 176;
      } else if (d2 < 26) {
        r = 255; g = 255; b = 255;
      }

      if (d3 < 16) {
        // Violet input node
        r = 180; g = 100; b = 255;
      } else if (d3 < 20) {
        r = 255; g = 255; b = 255;
      }

      buffer[pixelOffset] = r;
      buffer[pixelOffset + 1] = g;
      buffer[pixelOffset + 2] = b;
      buffer[pixelOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const compressed = zlib.deflateSync(buffer, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcBuffer = Buffer.alloc(4 + length);
  crcBuffer.write(type, 0, 4, 'ascii');
  data.copy(crcBuffer, 4);
  const crc = crc32(crcBuffer);
  chunk.writeUInt32BE(crc, 8 + length);

  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const resourcesDir = path.join(__dirname, '..', 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

const png = createPng(256, 256);
fs.writeFileSync(path.join(resourcesDir, 'icon.png'), png);
console.log('Successfully generated resources/icon.png (256x256)');
