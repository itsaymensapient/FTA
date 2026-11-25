const fs=require('fs'),path=require('path');
const {Figure}=require('./build-editorial.cjs');
const T=require('./diagram-tokens.json');
const pages=[];
const wrap=(s,n)=>{let out=[],line='';for(const w of s.split(' ')){if(line&&(line+' '+w).length>n){out.push(line);line=w;}else line+=(line?' ':'')+w;}if(line)out.push(line);return out;};
function page(slug,title,sub,h){const f=new Figure(slug,1600,h,title,sub);f.heading(title,sub,'CLOUDERA / HOSTING GUIDE');pages.push({slug,title,sub});return f;}
function box(f,id,x,y,w,h,title,lines,accent=false){f.box(id,x,y,w,h,title,lines,{titleSize:22,bodySize:16,fill:accent?T.accentTint:T.paper,stroke:accent?T.accent:T.rule});}
function footer(f,text){f.rule(64,f.height-66,1536,f.height-66);f.lines(64,f.height-38,wrap(text,166),{size:14,leading:22,color:T.muted});}

// 1. Concrete workload placement. Service boundaries, not a claimed FTA subnet map.
{
const f=page('cloudera-01-hosting','Where our agents would run on Cloudera','Reference proposal: Cloudera AI on Cloud for a protected GITEX demo; the actual FTA edition and release must be confirmed.',1740);
f.rect('release-note',64,184,1472,52,{fill:T.paper2},'zones');
f.text(88,216,'Release check: AI Studios is labelled Technical Preview in the reviewed overview. Agree the supported deployment path with Cloudera.',{size:16});
box(f,'browser',96,268,400,88,'GITEX browser / approved user',['Business or Inspector view; selected case']);
f.rect('workbench-boundary',64,392,1472,416,{fill:T.paper2,dash:true},'zones');
f.eyebrow(640,424,'CLOUDERA AI WORKBENCH / AUTHENTICATED PROJECT');
box(f,'frontend',96,456,400,192,'Workbench Application',[
 'Our custom screens + server-side adapter',
 'Trusted role, company and case context',
 'Preview / approve / cancel controls',
 'Calls workflow; displays progress and results'
]);
box(f,'agent-runtime',640,456,864,240,'Workbench Model endpoint — agent workflow',[
 'Supervisor + Data / Calculation / Knowledge / Explanation / Action tasks',
 'CPU workflow code and local tool functions; not one machine per agent',
 'Load Ali’s approved section files before planning and specialist execution',
 'Validate plans, tool requests and evidence; keep credentials server-side',
 'Deploy one pinned release of workflow, tool code and instruction versions'
],true);
f.path('browser-request',[[296,356],[296,456]],{color:T.link});
f.label(296,418,'HTTPS / AUTHENTICATED',{size:12});
f.path('start-workflow',[[496,552],[640,552]]);
f.label(568,536,'HTTPS',{size:12});
f.lines(96,700,[
 'Agent Studio authors/publishes the workflow.',
 'Ops & Metrics / Phoenix records run traces.',
 'POC start: one app + one workflow deployment.',
 'Measure concurrency before sizing resources.'
],{size:16,leading:28,color:T.muted});

f.rect('model-data-boundary',64,920,952,320,{fill:T.paper2,dash:true},'zones');
f.eyebrow(88,952,'MODEL + DATA SERVICES');
f.rect('fta-boundary',1064,920,472,320,{fill:T.paper2,dash:true},'zones');
f.eyebrow(1344,952,'FTA BACKEND');
box(f,'llm',96,992,400,192,'AI Inference + AI Registry',[
 'Registry holds the chosen model version',
 'Inference serves the language model',
 'GPU resources depend on model choice',
 'One endpoint may serve several agent roles'
]);
box(f,'warehouse',584,992,400,192,'Data Warehouse / Impala',[
 'Gold invoice, return and ledger tables',
 'Read-only validated SQL tool access',
 'Ranger policies / scoped data access',
 'No arbitrary model-generated writes'
]);
box(f,'case-actions',1096,992,408,192,'Case + approval + action API',[
 'Custom application/backend components',
 'Durable case records and approval ledger',
 'Demo submission APIs + status checks',
 'Verify the effect; prevent duplicates'
]);
f.path('model-call',[[704,696],[704,844],[296,844],[296,992]],{color:T.link});
f.label(496,828,'HTTPS / LLM API',{size:13});
f.path('data-call',[[1024,696],[1024,872],[784,872],[784,992]],{color:T.link});
f.label(896,856,'SQL CLIENT / TLS',{size:13});
f.path('action-call',[[1408,696],[1408,896],[1200,896],[1200,992]],{color:T.link});
f.label(1304,880,'HTTPS / TOOL API',{size:13});
f.text(64,1300,'Read this in plain language',{size:27,weight:600});
f.lines(64,1340,[
 'Workbench runs our application and workflow code. AI Inference supplies language generation. Gold supplies factual records.',
 'Approved instruction files ship with the workflow release or load from controlled storage. RAG is added only for document lookup.',
 'Business effects go through a backend API. Gold remains an analytical source; case state is stored durably outside worker memory.',
 'A shared service account does not automatically become the visitor’s identity: enforce company scope in trusted tools and data policies.'
],{size:17,leading:34});
f.rect('example',64,1512,1472,128,{fill:T.accentTint},'zones');
f.text(88,1548,'Example: Al Yasmeen asks “Why is my return different?”',{size:23,weight:600});
f.lines(88,1584,[
 'The CPU workflow loads guidance, calls the model to plan, queries Gold, calculates the gap and asks the model to explain the evidence.',
 'An approved demo correction uses the backend API; the workflow reads the resulting state before reporting a verified outcome.'
],{size:17,leading:28});
footer(f,'Proposed placement, not an installed system or verified network design. Use an existing approved model endpoint instead of AI Inference if appropriate.');f.save();
}

// 2. Deployment process: named outputs and ownership rather than a product logo catalog.
{
const f=page('cloudera-02-deploy','How we would deploy the GITEX agent application','Read top to bottom: platform setup → versioned project → workflow configuration → tools → publication → acceptance checks.',1540);
const rows=[
 ['Platform team + Cloudera','1  Prepare the target environment',[
  'Confirm cloud/on-premises edition, release, entitlement and network paths.',
  'Create Workbench/project; choose an approved LLM hosting route.'
 ],['OUTPUT: usable workspace, identity and reachable service endpoints.','If using AI Inference: plan Registry, compute cluster and model capacity.']],
 ['You / AI engineer','2  Build a reproducible project release',[
  'Version workflow code, reviewed instruction sections, tools and test data.',
  'Pin dependencies and runtime; configure secrets through approved controls.'
 ],['OUTPUT: one identifiable application release, with repeatable setup.','Keep secrets out of prompts, browser code and the source repository.']],
 ['You + platform team','3  Configure Agent Studio and the model',[
  'Use the documented prebuilt Studio runtime; set manager and specialist tasks.',
  'Connect the chosen model endpoint and test structured outputs / tool use.'
 ],['OUTPUT: an executable workflow calling a reachable language model.','An agent role is configuration plus tools; it is not a new trained model.']],
 ['You + data/backend owners','4  Wire the controlled tools and durable state',[
  'Connect read-only Gold queries, deterministic calculations and references.',
  'Implement case persistence, exact-payload approval and demo action APIs.'
 ],['OUTPUT: scoped, testable contracts that return facts and evidence IDs.','Do not expose a generic SQL writer or unrestricted submission function.']],
 ['You / workflow publisher','5  Publish the workflow and application',[
  'Agent Studio publishes the workflow engine as a Workbench Model endpoint.',
  'Connect the supplied interface or our custom Workbench Application.'
 ],['OUTPUT: authenticated workflow and UI endpoints, plus run traces.','Kickoff returns a trace ID; the UI tracks asynchronous execution.']],
 ['Whole delivery team','6  Verify and rehearse the full scenario',[
  'Check all four stories, both role views, approvals, failures and session reset.',
  'Measure model/tool latency and concurrent runs; keep the demo ready to serve.'
 ],['OUTPUT: acceptance evidence and an agreed demo runbook.','Use Al Yasmeen’s +486,200 / −74,200 / +412,000 as reference checks.']]
];
rows.forEach((r,i)=>{
 const y=216+i*184;
 f.rect('stage-'+i,64,y,1472,160,{fill:i===4?T.accentTint:T.paper2,stroke:i===4?T.accent:T.rule},'zones');
 f.eyebrow(88,y+27,r[0].toUpperCase());
 f.text(88,y+62,r[1],{size:24,weight:600});
 f.lines(88,y+100,r[2],{size:16,leading:28});
 f.lines(936,y+52,r[3].flatMap(t=>wrap(t,58)),{size:16,leading:26,color:T.muted});
 if(i<5)f.path('stage-arrow-'+i,[[800,y+160],[800,y+184]]);
});
f.text(64,1396,'Name trap: “Workbench Model” here runs the workflow code. “LLM endpoint” is the language model that code calls.',{size:20,weight:600});
f.text(64,1436,'We build and test the domain behavior. Cloudera supplies the supported runtime, deployment mechanisms and connected services.',{size:17});
footer(f,'This is a proposed deployment order, not a committed schedule or a verified sizing estimate. Source links and release constraints are in the guide.');f.save();
}

// 3. Runtime trace with a separate human decision between reading and acting.
{
const f=page('cloudera-03-request','One hosted request, from question to verified action','Worked example: Al Yasmeen return reconciliation. The scenario figures are from the supplied synthetic GITEX draft.',1760);
f.rect('async-note',64,184,1472,52,{fill:T.paper2},'zones');
f.text(88,216,'The app starts a workflow and gets a trace ID. It retrieves run events/results; the durable business case has its own separate ID.',{size:17});
const xs=[208,552,896,1240];
const labels=['UI + server adapter','Agent workflow / CPU','LLM endpoint','Scoped tools / backend'];
xs.forEach((x,i)=>{box(f,'actor-'+i,x-144,268,288,64,labels[i],[],i===1);f.rawPath('life-'+i,`M ${x} 332 V 1360`,{dash:true,arrow:false,width:1});});
const msgs=[
 [0,1,392,'1  Start: scoped question + selected case',false],
 [1,2,472,'2  Approved instructions + goal: propose a plan',false],
 [2,1,552,'3  Proposed plan; application validates it',true],
 [1,3,632,'4  Read Gold evidence; run certified reconciliation',false],
 [3,1,712,'5  Evidence IDs; +486,200 / −74,200 / +412,000',true],
 [1,2,792,'6  Explain these results; cite the supplied evidence',false],
 [2,1,872,'7  Draft explanation; application checks support',true],
 [1,0,952,'8  Show explanation and a correction preview',true],
 [0,1,1072,'9  Approve the exact preview version',false],
 [1,3,1152,'10  Backend checks approval; submits demo change',false],
 [3,1,1232,'11  Operation status + refreshed-record verification',true],
 [1,0,1312,'12  Verified outcome + shared case status',true]
];
f.rect('approval-fragment',64,992,1472,384,{fill:T.paper,stroke:T.rule},'zones');
f.label(400,1024,'OPT / ACTION PATH ONLY IF THE USER APPROVES THE EXACT PREVIEW',{size:11});
msgs.forEach((m,i)=>{f.path('msg-'+i,[[xs[m[0]],m[2]],[xs[m[1]],m[2]]],{dash:m[4]});f.label((xs[m[0]]+xs[m[1]])/2,m[2]-17,m[3],{size:14});});
f.rect('tools-example',64,1432,1472,232,{fill:T.paper2},'zones');
f.text(88,1470,'What the tool contracts mean in this example',{size:25,weight:600});
f.lines(88,1512,[
 'Read selected return: trusted company + period → authorized amounts, invoice IDs and a record snapshot.',
 'Reconcile return: those records + approved definition → signed box adjustments and AED 412,000 net difference.',
 'Submit demo change: exact payload + valid approval + unique operation key → one trackable operation.',
 'Verify change: operation ID + refreshed records → verified, pending or failed; the LLM cannot choose the status.'
],{size:18,leading:34});
footer(f,'A human pause is persisted in application case state; do not assume Agent Studio provides a complete approval/case-management system.');f.save();
}
fs.writeFileSync(path.join(__dirname,'cloudera-hosting-manifest.json'),JSON.stringify(pages,null,2));
console.log(JSON.stringify(pages.map(p=>p.slug)));
