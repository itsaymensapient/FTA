const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1119-907-0_26.1119.907.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
const {chromium}=require(path.join(runtime,'playwright'));
(async()=>{
 const edge=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p));
 const browser=await chromium.launch({headless:true,...(edge?{executablePath:edge}:{})});
 const reports=[];
 for(const slug of (process.argv.slice(2).length ? process.argv.slice(2) : ['fta-agent-architecture-overview','fta-agent-architecture-detailed'])){
  const context=await browser.newContext({viewport:{width:1600,height:1200},deviceScaleFactor:2});
  const page=await context.newPage();
  await page.goto(pathToFileURL(path.join(__dirname,slug+'.html')).href,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);
  const audit=await page.locator('svg').evaluate(svg=>{
   const b=svg.viewBox.baseVal;
   const outside=[...svg.querySelectorAll('text')].map(t=>({text:t.textContent,b:t.getBBox()})).filter(t=>t.b.x<0||t.b.y<0||t.b.x+t.b.width>b.width||t.b.y+t.b.height>b.height).map(t=>t.text);
   const text=[...svg.querySelectorAll('text')].map(t=>{const b=t.getBBox();return {text:t.textContent,x:b.x,y:b.y,w:b.width,h:b.height}});
   const overlaps=[];
   for(let i=0;i<text.length;i++)for(let j=i+1;j<text.length;j++){
    const a=text[i],c=text[j];
    if(a.x<c.x+c.w-1&&a.x+a.w>c.x+1&&a.y<c.y+c.h-1&&a.y+a.h>c.y+1)overlaps.push([a.text,c.text]);
   }
   return {width:b.width,height:b.height,textCount:text.length,outside,textOverlaps:overlaps};
  });
  await page.locator('svg').evaluate(el=>{
   const b=el.viewBox.baseVal;
   for(const [a,s] of [['width',b.width],['height',b.height]])for(const p of ['','min-','max-'])el.style.setProperty(p+a,s+'px','important');
   for(let a=el.parentElement;a;a=a.parentElement)a.style.overflow='visible';
  });
  await page.locator('svg').screenshot({path:path.join(__dirname,slug+'.png')});
  await context.close(); reports.push({slug,...audit});
 }
 await browser.close();
 fs.writeFileSync(path.join(__dirname,process.argv.slice(2).length?'gitex-role-render-checks.json':'render-checks.json'),JSON.stringify(reports,null,2));
 console.log(JSON.stringify(reports,null,2));
 if(reports.some(r=>r.outside.length||r.textOverlaps.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
