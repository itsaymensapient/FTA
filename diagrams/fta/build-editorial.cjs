const fs = require('fs');
const path = require('path');
const root = __dirname;
const T = JSON.parse(fs.readFileSync(path.join(root, 'diagram-tokens.json'), 'utf8'));
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

class Figure {
  constructor(slug, width, height, title, desc) {
    Object.assign(this, {slug, width, height, title, desc});
    this.layers = {zones: [], edges: [], nodes: [], labels: []};
    this.scene = []; this.serial = 0;
  }
  text(x, y, value, opts = {}, layer = 'nodes') {
    const size = opts.size || 16;
    const color = opts.color || T.ink;
    this.layers[layer].push(`<text x="${x}" y="${y}" fill="${color}" font-family="${esc(opts.mono ? T.mono : T.font)}" font-size="${size}" font-weight="${opts.weight || 400}" text-anchor="${opts.anchor || 'start'}"${opts.spacing ? ` letter-spacing="${opts.spacing}"` : ''}>${esc(value)}</text>`);
    this.scene.push({type:'text', id:`${this.slug}-text-${++this.serial}`,x,y:y-size,width:Math.max(20,value.length*size*.58),height:size*1.4,text:value,size,color,weight:opts.weight||400,anchor:opts.anchor||'start'});
  }
  lines(x,y,values,opts={}) { values.forEach((v,i)=>this.text(x,y+i*(opts.leading||24),v,opts)); }
  eyebrow(x,y,v) { this.text(x,y,v,{size:11,weight:600,color:T.muted,spacing:1.7}); }
  rect(id,x,y,w,h,opts={},layer='nodes') {
    const fill=opts.fill||T.paper; const stroke=opts.stroke||T.rule;
    this.layers[layer].push(`<rect data-node-id="${id}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.radius===undefined?6:opts.radius}" fill="${fill}" stroke="${stroke}" stroke-width="${opts.width||1.25}"${opts.dash?' stroke-dasharray="5 5"':''}/>`);
    this.scene.push({type:'rectangle',id,x,y,width:w,height:h,fill,stroke,dash:!!opts.dash});
  }
  box(id,x,y,w,h,title,body=[],opts={}) {
    this.rect(id,x,y,w,h,opts);
    this.text(x+24,y+34,title,{size:opts.titleSize||20,weight:600,color:opts.color||T.ink});
    this.lines(x+24,y+62,body,{size:opts.bodySize||16,leading:24,color:T.muted});
  }
  path(id,points,opts={}) {
    let d=`M ${points[0][0]} ${points[0][1]}`;
    for(let i=1;i<points.length;i++) {
      const p=points[i],prev=points[i-1],next=points[i+1];
      if(!next) { d+=` L ${p[0]} ${p[1]}`; break; }
      const r=Math.min(8,Math.hypot(p[0]-prev[0],p[1]-prev[1])/2,Math.hypot(next[0]-p[0],next[1]-p[1])/2);
      const a=[p[0]-Math.sign(p[0]-prev[0])*r,p[1]-Math.sign(p[1]-prev[1])*r];
      const b=[p[0]+Math.sign(next[0]-p[0])*r,p[1]+Math.sign(next[1]-p[1])*r];
      d+=` L ${a[0]} ${a[1]} Q ${p[0]} ${p[1]} ${b[0]} ${b[1]}`;
    }
    this.rawPath(id,d,opts);
    this.scene.push({type:'arrow',id,points,color:opts.color||T.muted,dash:!!opts.dash,arrow:opts.arrow!==false});
  }
  rawPath(id,d,opts={}) {
    this.layers.edges.push(`<path data-edge-id="${id}" d="${d}" fill="none" stroke="${opts.color||T.muted}" stroke-width="${opts.width||1.5}" stroke-linejoin="round"${opts.dash?' stroke-dasharray="5 5"':''}${opts.arrow===false?'':` marker-end="url(#${this.slug}-arrow${opts.color===T.accent?'-accent':''})"`}/>`);
  }
  rule(x1,y1,x2,y2) { this.layers.zones.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${T.rule}" stroke-width="1"/>`); }
  label(x,y,value,opts={}) {
    const size=opts.size||11,w=value.length*size*.64+16;
    this.layers.labels.push(`<rect x="${x-w/2}" y="${y-size-4}" width="${w}" height="${size+9}" fill="${T.paper}"/>`);
    this.text(x,y,value,{size,weight:600,color:opts.color||T.muted,anchor:'middle',spacing:.7},'labels');
  }
  heading(title,subtitle,kind) {
    this.eyebrow(64,40,`FTA / AGENTIC AI / ${kind}`);
    this.text(64,92,title,{size:36,weight:600});
    this.text(64,128,subtitle,{size:17,color:T.muted});
    this.text(this.width-64,40,'PROPOSED · 23 NOV 2026',{size:11,color:T.muted,anchor:'end',spacing:1});
    this.rule(64,156,this.width-64,156);
  }
  save() {
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" role="img" aria-labelledby="${this.slug}-title ${this.slug}-desc"><title id="${this.slug}-title">${esc(this.title)}</title><desc id="${this.slug}-desc">${esc(this.desc)}</desc><defs><marker id="${this.slug}-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M 0 0 L 8 3 L 0 6 Z" fill="${T.muted}"/></marker><marker id="${this.slug}-arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M 0 0 L 8 3 L 0 6 Z" fill="${T.accent}"/></marker></defs><rect width="${this.width}" height="${this.height}" fill="${T.paper}"/>${Object.values(this.layers).map(a=>a.join('\n')).join('\n')}</svg>`;
    const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(this.title)}</title><style>html,body{margin:0;background:#fff;color:${T.ink};font-family:${T.font}}main{max-width:100%;min-width:0}.diagram-container{width:100%;overflow-x:auto}svg{display:block;width:100%;min-width:${this.width}px;height:auto}@media print{.diagram-container{overflow:visible}svg{min-width:0}}</style></head><body><main><div class="diagram-container">${svg}</div></main></body></html>`;
    fs.writeFileSync(path.join(root,this.slug+'.html'),html);
    fs.writeFileSync(path.join(root,this.slug+'.scene.json'),JSON.stringify({width:this.width,height:this.height,elements:this.scene},null,2));
    return this;
  }
}

function detailed() {
 const f=new Figure('fta-agent-architecture-detailed',1600,1600,'FTA agent architecture: Ali guidance approach','Reviewed section instructions are prepared before runtime, loaded before planning, and used by semantic, ML and retrieval agents within a validated supervisor workflow.');
 f.heading('Data agents, with approved guidance loaded first','Ali’s execution flow, section-based instructions and Sulieman’s specialist responsibilities','DETAILED ARCHITECTURE');
 f.rect('preparation-boundary',64,188,1472,176,{fill:T.paper2,stroke:T.rule},'zones');
 f.eyebrow(88,216,'PREPARATION / DOMAIN + MODEL OWNERS');
 f.box('model-inputs',88,236,320,96,'Model logic + mappings',['Rules, output meanings and reason IDs'],{titleSize:19,bodySize:14});
 f.box('reviewed-preparation',496,236,400,96,'Prepare reviewed plain language',['Describe behavior, interpretation and limits'],{titleSize:19,bodySize:14});
 f.box('instruction-files',984,220,528,128,'Versioned section instruction files',['Domain / semantic / calculation / model','Explanation guidance and permitted tool use','Key: domain + section + applicable version'],{titleSize:20,bodySize:15,stroke:T.accent,fill:T.accentTint,width:1.75});
 f.path('prepare-guidance',[[408,284],[496,284]]);
 f.path('publish-guidance',[[896,284],[984,284]]);
 f.eyebrow(1232,420,'RUNTIME / EVERY QUESTION');
 f.rect('question',64,384,240,44,{radius:22});
 f.text(88,412,'User question',{size:17,weight:600});
 f.path('question-to-supervisor',[[184,428],[184,456]]);
 const xs=[64,356,648,940,1232],ws=[240,240,240,240,304];
 const steps=[['Supervisor Agent',['Resolve domain','and trusted permissions']],['Load instructions',['Select applicable sections','Attach approved context']],['Build plan',['Choose agents and tools','Declare task dependencies']],['Validate plan',['Check scope and tool use','Enforce execution limits']],['Schedule tasks',['Run only required tasks','Respect dependencies']]];
 steps.forEach((s,i)=>f.box(`runtime-${i+1}`,xs[i],456,ws[i],112,`${i+1}  ${s[0]}`,s[1],{titleSize:18,bodySize:14,fill:T.paper,stroke:T.rule,width:1.25}));
 for(let i=0;i<4;i++)f.path(`planning-step-${i}`,[[xs[i]+ws[i],512],[xs[i+1],512]]);
 f.path('load-before-planning',[[984,312],[936,312],[936,396],[476,396],[476,456]],{color:T.accent});
 f.label(704,384,'LOAD FIRST',{color:T.accent});
 f.box('clarify-reject',940,620,240,56,'Clarify / reject',[],{titleSize:18,dash:true});
 f.path('invalid-plan',[[1060,568],[1060,620]],{dash:true});
 f.label(1124,604,'INVALID');
 f.text(64,616,'Each specialist loads its relevant approved sections before execution.',{size:16,color:T.muted});
 f.text(64,648,'The supervisor owns state, coordination and bounded replanning.',{size:16,color:T.muted});
 f.path('schedule-semantic',[[1308,568],[1308,704],[320,704],[320,764]]);
 f.path('schedule-ml',[[1384,568],[1384,720],[824,720],[824,764]]);
 f.path('schedule-rag',[[1460,568],[1460,736],[1304,736],[1304,764]]);
 f.eyebrow(64,744,'SELECTED AGENT WORKFLOWS');
 f.rect('semantic-subgraph',64,764,512,248,{fill:T.paper2});
 f.eyebrow(88,792,'SEMANTIC SUBGRAPH');
 f.text(88,828,'Data Query Agent',{size:21,weight:600});
 f.lines(88,856,['Resolve terms and schema; build a query plan','Generate SQL; execute through scoped tools'],{size:16,color:T.muted});
 f.rule(88,896,552,896);
 f.text(88,928,'Calculation Agent',{size:21,weight:600});
 f.lines(88,956,['Select certified formulas and input references','Run deterministic functions; return working'],{size:16,color:T.muted});
 f.rect('ml-subgraph',608,764,432,248,{fill:T.paper2});
 f.eyebrow(632,792,'ML SUBGRAPH');
 f.text(632,828,'ML Explanation Agent',{size:21,weight:600});
 f.lines(632,864,['Use loaded model interpretation guidance','Read authorized prediction facts','Receive approved evidence descriptions','Explain supported findings and limits'],{size:16,color:T.muted,leading:28});
 f.rect('rag-subgraph',1072,764,464,248,{fill:T.paper2});
 f.eyebrow(1096,792,'RAG SUBGRAPH');
 f.text(1096,828,'Knowledge Agent',{size:21,weight:600});
 f.lines(1096,864,['Search approved documents and metadata','Filter access, applicability and versions','Return passages and citations'],{size:16,color:T.muted,leading:28});
 f.text(1096,976,'Retrieved content remains supporting evidence.',{size:14,color:T.muted});
 f.eyebrow(64,1052,'SCOPED TOOLS');
 f.path('semantic-tools',[[320,1012],[320,1080]]);
 f.path('ml-tools',[[824,1012],[824,1080]]);
 f.path('rag-tools',[[1304,1012],[1304,1080]]);
 f.path('semantic-tool-results',[[352,1080],[352,1012]],{dash:true});
 f.path('ml-tool-results',[[856,1080],[856,1012]],{dash:true});
 f.path('rag-tool-results',[[1336,1080],[1336,1012]],{dash:true});
 f.box('gold-tools',64,1080,512,128,'Gold SQL + certified calculations',['Enforce scope; validate SQL, inputs and limits','Return values, units and query provenance','Source: authorized Gold views'],{titleSize:20,bodySize:15});
 f.box('evidence-adapter',608,1080,432,128,'Prediction evidence adapter',['Resolve IDs to approved descriptions','Return prediction facts and evidence refs','Source: records + reviewed mappings'],{titleSize:20,bodySize:15,stroke:T.accent,fill:T.accentTint,width:1.75});
 f.box('retrieval-tools',1072,1080,464,128,'Document retrieval',['Authorized keyword / vector retrieval','Return applicable passages and citations','Source: approved document index'],{titleSize:20,bodySize:15});
 f.path('collect-semantic',[[576,980],[592,980],[592,1240],[172,1240],[172,1288]]);
 f.path('collect-ml',[[1040,980],[1056,980],[1056,1256],[280,1256],[280,1288]]);
 f.path('collect-rag',[[1536,980],[1552,980],[1552,1272],[388,1272],[388,1288]]);
 f.box('result-validation',64,1288,432,80,'Collect + validate results',['Check figures, provenance and completeness'],{titleSize:20,bodySize:14});
 f.box('investigation',584,1288,432,80,'Investigation Agent',['Reconcile findings; propose further evidence'],{titleSize:20,bodySize:14,dash:true});
 f.box('reporting',1104,1288,432,80,'Reporting Agent',['Answer with calculations, citations and limits'],{titleSize:20,bodySize:14});
 f.path('investigate-if-needed',[[496,1328],[584,1328]]);
 f.label(540,1308,'IF NEEDED');
 f.path('investigation-to-report',[[1016,1328],[1104,1328]]);
 f.path('direct-answer',[[280,1368],[280,1412],[1320,1412],[1320,1368]]);
 f.label(920,1396,'DIRECT ANSWER');
 f.rawPath('bounded-replan','M 692 1368 L 692 1404 a 8 8 0 0 0 0 16 L 692 1432 Q 692 1440 684 1440 L 180 1440 a 8 8 0 0 0 -16 0 L 48 1440 Q 40 1440 40 1432 L 40 520 Q 40 512 48 512 L 64 512',{dash:true});
 f.label(104,1424,'REPLAN');
 f.box('failure-policy',64,1460,432,72,'Failure policy',['Limited retry, clarification or human handoff'],{titleSize:20,bodySize:14,dash:true});
 f.path('result-failure',[[172,1368],[172,1460]],{dash:true});
 f.label(232,1396,'FAILURE');
 f.rect('final-response',1104,1460,432,56,{radius:28});
 f.text(1132,1496,'Final response',{size:20,weight:600});
 f.path('final-report',[[1428,1368],[1428,1460]]);
 f.rule(64,1552,1536,1552);
 f.text(64,1580,'Shared runtime: supervisor-mediated task/result messages, access enforcement, durable state, validation, audit and evaluation.',{size:15,color:T.muted});
 return f.save();
}

function overview() {
 const f=new Figure('fta-agent-architecture-overview',1600,1000,'FTA data agents: architecture overview','Approved section instructions guide the supervisor and specialist agents, while a scoped adapter provides plain-language prediction evidence.');
 f.heading('A supervised agent layer over Gold','Approved instructions shape the plan; scoped tools provide data and evidence.','ARCHITECTURE OVERVIEW');
 f.eyebrow(64,204,'PREPARED AND REVIEWED BEFORE RUNTIME');
 f.box('prepared-context',64,224,448,120,'Section instruction library',['Plain-language domain, calculation and model guides','Reviewed, approved and versioned'],{titleSize:21,bodySize:15,fill:T.accentTint,stroke:T.accent,width:1.75});
 f.box('supervisor-overview',672,224,448,120,'Supervisor Agent',['Resolve domain and permissions; load sections','Plan, validate, schedule and coordinate'],{titleSize:23,bodySize:15,stroke:T.accent,width:1.75});
 f.rect('user-overview',1248,224,288,72,{radius:36});
 f.text(1276,268,'Authenticated question',{size:19,weight:600});
 f.path('instructions-to-supervisor',[[512,284],[672,284]],{color:T.accent});
 f.label(592,264,'LOAD FIRST',{color:T.accent});
 f.path('user-to-supervisor',[[1248,260],[1120,260]]);
 f.eyebrow(64,416,'SPECIALIST WORKFLOWS / SELECT ONLY WHAT THE TASK NEEDS');
 f.rect('semantic-overview',64,444,512,200,{fill:T.paper2});
 f.text(88,480,'Semantic subgraph',{size:22,weight:600});
 f.text(88,520,'Data Query Agent',{size:19,weight:600});
 f.text(88,546,'Schema, query planning and validated read-only SQL',{size:15,color:T.muted});
 f.text(88,584,'Calculation Agent',{size:19,weight:600});
 f.text(88,610,'Certified formulas, deterministic execution and working',{size:15,color:T.muted});
 f.rect('ml-overview',608,444,432,200,{fill:T.paper2});
 f.text(632,480,'ML subgraph',{size:22,weight:600});
 f.text(632,520,'ML Explanation Agent',{size:19,weight:600});
 f.lines(632,550,['Loaded guidance + authorized prediction facts','Approved evidence descriptions','Supported explanation and limitations'],{size:15,color:T.muted,leading:27});
 f.rect('rag-overview',1072,444,464,200,{fill:T.paper2});
 f.text(1096,480,'RAG subgraph',{size:22,weight:600});
 f.text(1096,520,'Knowledge Agent',{size:19,weight:600});
 f.lines(1096,550,['Approved documents and metadata','Authorized, version-aware retrieval','Relevant passages with citations'],{size:15,color:T.muted,leading:27});
 f.path('dispatch-semantic',[[784,344],[784,388],[320,388],[320,444]]);
 f.path('dispatch-ml',[[896,344],[896,404],[824,404],[824,444]]);
 f.path('dispatch-rag',[[1008,344],[1008,388],[1304,388],[1304,444]]);
 f.eyebrow(64,696,'SCOPED TOOLS');
 f.rule(64,712,1536,712);
 f.text(88,752,'Gold SQL + certified calculations',{size:19,weight:600});
 f.text(88,780,'Authorized views, formulas, units and provenance',{size:15,color:T.muted});
 f.text(632,752,'Prediction evidence adapter',{size:19,weight:600});
 f.text(632,780,'Reason IDs resolved to approved descriptions',{size:15,color:T.muted});
 f.text(1096,752,'Document retrieval',{size:19,weight:600});
 f.text(1096,780,'Access-filtered sources and applicable citations',{size:15,color:T.muted});
 f.path('semantic-tool-overview',[[320,644],[320,712]]);
 f.path('ml-tool-overview',[[824,644],[824,712]]);
 f.path('rag-tool-overview',[[1304,644],[1304,712]]);
 f.rule(64,816,1536,816);
 f.eyebrow(64,858,'RESULT HANDLING');
 f.text(64,890,'Collect and validate',{size:20,weight:600});
 f.text(64,918,'Figures, completeness and evidence',{size:15,color:T.muted});
 f.text(584,890,'Investigation Agent',{size:20,weight:600});
 f.text(584,918,'When needed; follow-up via Supervisor',{size:15,color:T.muted});
 f.text(1104,890,'Reporting Agent',{size:20,weight:600});
 f.text(1104,918,'Answer, calculation working and citations',{size:15,color:T.muted});
 f.path('validated-to-investigation',[[416,884],[536,884]],{dash:true});
 f.path('investigation-to-report-overview',[[968,884],[1064,884]]);
 f.text(64,972,'The supervisor owns the journey. Every tool enforces scope. Missing evidence leads to clarification or review.',{size:15,color:T.muted});
 return f.save();
}

module.exports = {Figure};
if (require.main === module) {
 detailed(); overview();
 console.log('Created detailed and overview HTML sources with editable geometry scenes.');
}
