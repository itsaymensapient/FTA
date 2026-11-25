const fs = require('fs');
const src = process.argv[2];
const dest = process.argv[3];
const h = fs.readFileSync(src, 'utf8');
const text = h
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
fs.writeFileSync(dest, text);
console.log('chars', text.length);
console.log(text.slice(0, 3000));
