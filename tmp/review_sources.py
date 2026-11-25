from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
import json
from pypdf import PdfReader
import subprocess
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
out = root / 'tmp' / 'source_review'
out.mkdir(parents=True, exist_ok=True)
pdf = PdfReader(root / 'documents' / 'Cloudera_Enterprise_AI_Explainer.pdf')
subprocess.run(['pdftoppm','-scale-to','1100','-png',str(root/'documents'/'Cloudera_Enterprise_AI_Explainer.pdf'),str(out/'render')],check=True)
parts = []
thumbs = []
renders=sorted(out.glob('render-*.png'))
for i, page in enumerate(pdf.pages):
    parts.append(f'\n=== PDF PAGE {i+1} ===\n' + page.extract_text())
    p = renders[i]
    im = Image.open(p).convert('RGB')
    im.thumbnail((600,800))
    tile = Image.new('RGB',(640,850),'#dddddd')
    tile.paste(im,((640-im.width)//2,30))
    ImageDraw.Draw(tile).text((12,8),f'Page {i+1}',fill='black')
    thumbs.append(tile)
(out/'pdf-text.txt').write_text('\n'.join(parts),encoding='utf-8')
for start in range(0,len(thumbs),6):
    batch=thumbs[start:start+6]
    sheet=Image.new('RGB',(640*min(3,len(batch)),850*((len(batch)+2)//3)),'white')
    for j,im in enumerate(batch): sheet.paste(im,((j%3)*640,(j//3)*850))
    sheet.save(out/f'pdf-contact-{start//6+1}.png')
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with ZipFile(root/'documents'/'Cloudera_AI_Agent_Tech_Stack.pptx') as z:
    slides=sorted([n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')],key=lambda n:int(n.split('slide')[-1].split('.')[0]))
    parts=[]
    for s in slides:
        parts.append('\n=== '+s+' ===\n'+'\n'.join(n.text or '' for n in ET.fromstring(z.read(s)).findall('.//a:t',ns)))
        note=s.replace('slides/slide','notesSlides/notesSlide')
        if note in z.namelist(): parts.append('NOTES\n'+'\n'.join(n.text or '' for n in ET.fromstring(z.read(note)).findall('.//a:t',ns)))
    media=[n for n in z.namelist() if n.startswith('ppt/media/')]
    for m in media: (out/Path(m).name).write_bytes(z.read(m))
    (out/'ppt-text.txt').write_text('\n'.join(parts),encoding='utf-8')
print(json.dumps({'pdf_pages':len(pdf.pages),'ppt_slides':len(slides),'ppt_media':media,'output':str(out)},indent=2))
