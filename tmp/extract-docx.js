const fs = require('fs');
const { execFileSync } = require('child_process');
const src = process.argv[2];
const dest = process.argv[3];
const tmp = dest + '.zipcopy';
const outDir = dest + '.unz';
fs.copyFileSync(src, tmp);
try { fs.rmSync(outDir, { recursive: true, force: true }); } catch (_) {}
fs.mkdirSync(outDir, { recursive: true });
execFileSync('powershell.exe', ['-NoProfile','-Command',"Expand-Archive -LiteralPath '" + tmp.replace(/'/g,"''") + "' -DestinationPath '" + outDir.replace(/'/g,"''") + "' -Force"], {stdio:'inherit'});
const xml = fs.readFileSync(outDir + '/word/document.xml', 'utf8');
const text = xml.replace(/<\/w:p>/g,'\n').replace(/<w:tab[^/]*\/>/g,'\t').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/\n{3,}/g,'\n\n').trim();
fs.writeFileSync(dest, text);
fs.unlinkSync(tmp);
try { fs.rmSync(outDir, { recursive: true, force: true }); } catch (_) {}
console.log('chars', text.length);
