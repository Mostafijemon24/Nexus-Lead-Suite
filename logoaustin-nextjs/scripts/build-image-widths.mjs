// Derives src -> available widths map from the image inventory (used by src/lib/image-loader.ts).
import fs from 'node:fs';
const inv = JSON.parse(fs.readFileSync('src/content/image-inventory.json', 'utf8'));
const map = Object.fromEntries(inv.filter((i) => i.src && i.widths?.length).map((i) => [i.src, i.widths]));
fs.writeFileSync('src/content/image-widths.json', JSON.stringify(map));
console.log('image-widths.json:', Object.keys(map).length, 'images');
