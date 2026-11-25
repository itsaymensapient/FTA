const fs=require('fs');
const path=require('path');
const {Figure}=require('./build-editorial.cjs');
const T=require('./diagram-tokens.json');
const {appendWorkedExample}=require('./learning-worked-examples.cjs');
const saveFigure=Figure.prototype.save;
Figure.prototype.save=function(){appendWorkedExample(this,T);return saveFigure.call(this);};
const dir=__dirname;
const pages=[];
function page(slug,title,sub,height=1200){const f=new Figure(slug,1600,height,title,sub);f.heading(title,sub,'GITEX / LEARNING GUIDE');pages.push({slug,title,sub});return f;}
function block(f,x,y,w,title,lines,accent=false,h){f.box(title.replace(/\W/g,'-'),x,y,w,h||80+lines.length*25,title,lines,{titleSize:21,bodySize:16,fill:accent?T.accentTint:T.paper,stroke:accent?T.accent:T.rule});}
function section(f,y,n,title,sub){f.eyebrow(64,y,n);f.text(64,y+36,title,{size:25,weight:600});if(sub)f.text(64,y+65,sub,{size:16,color:T.muted});}
function footer(f,y,text){f.rule(64,y-24,1536,y-24);f.text(64,y,text,{size:15,color:T.muted});}

// 01. System decomposition: a layered responsibility map with concrete interfaces.
{
const f=page('learn-01-system','Understand the complete system','You build the agent application that connects approved guidance, trusted data and operational workflows.',1320);
const rows=[
 ['01  VISITOR EXPERIENCE','Frontend / application team',['Inspector briefing; Business company view','Six-step tracker, evidence panels and approvals'],['INPUT: question, selected case and user decision','OUTPUT: an explanation, a draft or an action preview']],
 ['02  TRUSTED REQUEST CONTEXT','Backend + platform + AI integration',['Role, permitted company scope, case and period','Session ID and application-controlled demo clock'],['The visitor name is a greeting, not authorization.','A business question cannot expand company access.']],
 ['03  AGENT APPLICATION','YOU / AI ENGINEER',['Supervisor, instruction loader and specialist tasks','Data, calculation, knowledge, explanation and actions'],['INPUT: scoped goal + approved instruction sections','OUTPUT: evidence-backed answer or proposed action']],
 ['04  EXECUTION AND STATE','AI adapters + backend / data owners',['Read-only SQL, certified rules and calculations','Approval checks, case transitions and event history'],['The model requests a tool; the tool checks authority.','Records and task state survive role switching.']],
 ['05  RECORDS AND EVIDENCE','Data engineering + domain owners',['Synthetic invoices, ledger, returns and registrations','Approved rule descriptions, letters and documents'],['Stable IDs link every finding to its source records.','Expected totals form the reference test dataset.']],
 ['06  CLOUDERA ENVIRONMENT','Cloudera / infrastructure team',['Workbench development and model-serving endpoints','Agent orchestration and governed data connections'],['Candidate services depend on the target release.','Our custom logic still needs implementation and tests.']]
];
rows.forEach((r,i)=>{const y=204+i*160;f.rect(`layer-${i}`,64,y,1472,144,{fill:i===2?T.accentTint:(i%2?T.paper:T.paper2),stroke:i===2?T.accent:T.rule},'zones');f.eyebrow(88,y+28,r[0]);f.text(88,y+62,r[1],{size:19,weight:600});f.lines(528,y+52,r[2],{size:16,leading:29,color:T.ink});f.lines(1064,y+52,r[3],{size:15,leading:29,color:T.muted});});
f.text(64,1216,'Core distinction',{size:23,weight:600});f.text(64,1252,'The model interprets language. Your application defines the workflow. Tools establish facts and execute approved effects.',{size:17});
footer(f,1296,'Proposed responsibility split. Confirm owners, interfaces and deployment support before committing to delivery.');f.save();
}

// 02. Preparation, loading and runtime evidence are distinct contracts.
{
const f=page('learn-02-instructions','How Ali’s instruction-file approach works','Approved task instructions, retrieved references and prediction evidence have different jobs.',1360);
section(f,204,'A / PREPARE BEFORE THE DEMO','Turn technical and business meaning into reviewed section files');
block(f,64,300,432,'Inputs from the owners',['Model or rule behavior and output meanings','Certified formula and period definitions','Approved explanations and action options'],false,160);
block(f,584,300,432,'Review and publish',['Write plain-language procedures','Domain / ML owners approve meaning','Version sections and their applicability'],false,160);
block(f,1104,300,432,'Instruction section library',['domain / return-reconciliation','calculation / emirate-gap','model / classification-interpretation'],true,160);
f.path('prepare',[[496,380],[584,380]]);f.path('publish',[[1016,380],[1104,380]]);
section(f,520,'B / LOAD FOR EACH REQUEST','Resolve the task and load the relevant sections before planning');
block(f,64,616,432,'Trusted context + section lookup',['Role, company, case and period','Explicit approved section IDs and versions','Do not rely on similarity search for rules'],false,160);
block(f,584,616,432,'Supervisor builds a bounded plan',['Tasks, dependencies and allowed tools','Expected evidence and completion criteria','Validate scope and execution limits'],true,160);
block(f,1104,616,432,'Specialists receive task context',['Relevant instruction sections only','Authorized record / evidence references','Tools permitted for this particular task'],false,160);
f.path('load-to-plan',[[496,696],[584,696]]);f.path('plan-to-specialists',[[1016,696],[1104,696]]);
section(f,836,'C / OBTAIN EVIDENCE DURING EXECUTION','The guidance teaches interpretation; evidence supports the individual answer');
const xs=[64,584,1104];
block(f,xs[0],936,432,'Data and calculation results',['Invoice IDs, amounts and return boxes','Query ID, formula version, units and period','The language model does not invent totals'],false,160);
block(f,xs[1],936,432,'Approved prediction descriptions',['Evidence tool reads the recorded prediction','Resolve identifiers with reviewed mappings','Pass descriptions and supporting facts'],false,160);
block(f,xs[2],936,432,'Retrieved reference passages',['Approved guidance and document sections','Access, date and version filters','Citations support statements, not tool rights'],false,160);
f.text(64,1156,'What an explanation can say',{size:23,weight:600});
f.lines(64,1192,['“These records account for the difference, using the approved calculation definition.”','If evidence is absent: explain the gap and request review. A general model guide cannot prove an individual cause.'],{size:17,leading:30});
footer(f,1328,'Suggested section names are proposed examples. Instruction loading supplies context; it does not fine-tune model weights.');f.save();
}

// 03. A concrete time-ordered investigation with exact draft quantities.
{
const f=page('learn-03-reconciliation','Trace Scenario 2 from question to evidence','Al Yasmeen: the draft expects a Dubai increase, an Abu Dhabi decrease and an AED 412,000 net gap.',1392);
const cx=[208,552,896,1240],labels=['Visitor / application','Supervisor','Specialist workflow','Scoped data / calc tools'];
cx.forEach((x,i)=>{block(f,x-144,216,288,labels[i],[],i===1,64);f.rawPath(`life-${i}`,`M ${x} 280 V 1136`,{dash:true,arrow:false,width:1});});
const msgs=[
 [0,1,352,'1  “Explain this return discrepancy.”',false],
 [1,2,432,'2  Scoped case + approved reconciliation instructions',false],
 [2,3,512,'3  Read return, invoice and ledger records',false],
 [3,2,592,'4  Authorized rows + source IDs + snapshots',true],
 [2,3,672,'5  Reconcile boxes and calculate the net gap',false],
 [3,2,752,'6  Dubai +486,200; Abu Dhabi −74,200; net +412,000',true],
 [2,1,832,'7  Evidence: 34 cut-off invoices + 4 branch-allocation invoices',true],
 [1,2,912,'8  Investigate completeness; prepare the supported explanation',false],
 [2,1,992,'9  Findings + evidence references + proposed next step',true],
 [1,0,1072,'10  Show explanation, invoice list and draft options',true]
];
msgs.forEach((m,i)=>{const a=cx[m[0]],b=cx[m[1]],y=m[2];f.path(`message-${i}`,[[a,y],[b,y]],{dash:m[4]});f.label((a+b)/2,y-16,m[3],{size:14});});
f.rect('working',64,1176,1472,128,{fill:T.paper2});
f.text(88,1212,'Working that comes from tools',{size:23,weight:600});
f.text(88,1252,'Dubai: 1,626,200 − 1,140,000 = 486,200',{size:18});
f.text(696,1252,'Abu Dhabi: 214,600 − 288,800 = −74,200',{size:18});
f.text(88,1284,'Net: 486,200 − 74,200 = AED 412,000. The explanation must identify the supporting records.',{size:17});
footer(f,1360,'Draft scenario figures, not live taxpayer findings. This diagram ends before approval and submission; see the action flow.');f.save();
}

// 04. Actions and state: show the payload, authorization and record checks.
{
const f=page('learn-04-actions','How an agent acts without losing control','Drafting, approving, executing and verifying are separate steps with separate evidence.',1320);
block(f,64,224,432,'1  Build an action preview',['Action Agent prepares a draft or tool request','Exact company, case and affected record IDs','Proposed values and document attachments'],false,160);
block(f,584,224,432,'2  Human reviews and approves',['Show before / after values and the full draft','Allow edit, cancel or approve','Bind approval to the exact payload version'],true,160);
block(f,1104,224,432,'3  Backend rechecks and executes',['Recheck role, scope and record freshness','Reject changed or unapproved payloads','Use an idempotency key to prevent repeats'],false,160);
f.path('preview',[[496,304],[584,304]]);f.path('approve',[[1016,304],[1104,304]]);
block(f,1104,528,432,'4  Store the real operation status',['Return operation ID and committed status','If the outcome is unknown, check status first','Do not blindly repeat a timed-out submission'],false,160);
block(f,584,528,432,'5  Reconcile the new evidence',['Read the submitted disclosure or documents','Run the same validation against the new state','Report unresolved differences explicitly'],false,160);
block(f,64,528,432,'6  Continue the shared case',['Both roles read the same case and events','Record approvals, submissions and checks','Close only when closure conditions are met'],false,160);
f.path('execute-to-status',[[1320,384],[1320,528]]);f.path('status-to-check',[[1104,608],[1016,608]]);f.path('check-to-case',[[584,608],[496,608]]);
section(f,756,'PERSISTENT STATE / BACKEND CONTRACT','What must survive a restart, role switch or repeated button press');
f.lines(64,856,['case_id + company_id + authorized role scope','current workflow stage + completed task IDs','approved payload version + action operation ID','evidence references + instruction versions','event timestamps + separate simulated business dates'],{size:19,leading:40});
f.lines(896,856,['Demo clock: move to the next prepared event.','Approval: still required before each effect.','Pending: a valid status, not an automatic closure.','Reset: isolate or clear the visitor session safely.','All external actions stay inside the demo sandbox.'],{size:18,leading:40,color:T.muted});
footer(f,1288,'Case/state storage and business APIs are application components to build or integrate; confirm Cloudera runtime support separately.');f.save();
}

// 05 and 06. Scenario playbooks keep specific evidence and branch behavior visible.
function playbooks(slug,title,sub,stories){
const f=page(slug,title,sub,1440);
stories.forEach((s,i)=>{const y=208+i*552;section(f,y,s.tag,s.title,s.sub);const top=y+104;
block(f,64,top,432,'Evidence and deterministic checks',s.evidence,false,208);
block(f,584,top,432,'Agent tasks and guidance',s.agents,true,208);
block(f,1104,top,432,'Approved action and outcome',s.action,false,208);
f.path(`evidence-agent-${i}`,[[496,top+104],[584,top+104]]);f.path(`agent-action-${i}`,[[1016,top+104],[1104,top+104]]);
f.eyebrow(64,top+260,'BRANCHES / WHAT YOUR IMPLEMENTATION MUST HANDLE');
f.lines(64,top+300,s.branches,{size:17,leading:32});});
footer(f,1408,'All amounts and behaviors are from the synthetic demonstration draft. Tax interpretations and action policy require domain-owner approval.');f.save();
}
playbooks('learn-05-invoice-refund','Scenario playbooks: invoice and refund','These stories reuse the same supervisor, guidance loader, evidence tools, approval gate and case engine.',[
{tag:'SCENARIO 1 / LIVE E-INVOICE',title:'Najmat: explain a contextual invoice flag and verify its correction',sub:'The default invoice is syntactically valid. The issue is the configured tax treatment of selected lines.',evidence:['Net amount: AED 36,500','VAT charged: AED 525','Configured expected VAT: AED 1,825','Difference: AED 1,300','Buyer registration and line-level check results'],agents:['Load approved invoice-check sections','Explain each finding using its source line','Distinguish format checks from context checks','Draft credit note + replacement invoice','Preserve original and replacement IDs'],action:['Visitor approves the exact documents','Send through the illustrative seller app','Ingest and check both correction documents','Verify the new result before reporting success','Expose the same evidence to Inspector'],branches:['All checks pass: go directly to completion. Multiple flags: explain each supported finding.','A pending or failed correction stays open. Do not claim the invoice was corrected because a draft exists.']},
{tag:'SCENARIO 3 / REFUND EVIDENCE',title:'Al Waha: separate supported, corrected and pending refund components',sub:'Evidence collection changes the recommendation; missing e-invoices alone do not determine the result.',evidence:['Refund claim: AED 284,600','Initially supported: AED 53,600','Further paper-invoice support: AED 150,000','Unsupported and corrected: AED 34,200','Supplier-related amount pending: AED 46,800'],agents:['Retrieve claim breakdown and source records','Load approved evidence-review guidance','Match documents to the amounts they support','Draft a request or decision recommendation','Explain which uncertainty remains unresolved'],action:['Visitor approves the demo recommendation','Final supported total: AED 203,600','AED 34,200 corrected / not approved','AED 46,800 remains on hold','Retain the related supplier issue as open'],branches:['If documents are insufficient, request further evidence or route for review.','A completed review is different from a fully resolved refund or a closed supplier case.']}
]);
playbooks('learn-06-return-disclosure','Scenario playbooks: reconciliation and disclosure','Period allocation and arithmetic come from approved definitions and tools; the agents explain and coordinate.',[
{tag:'SCENARIO 2 / RETURN MISMATCH',title:'Al Yasmeen: explain the AED 412,000 net discrepancy',sub:'Separate the accounting cut-off difference from the Emirate reallocation instead of treating them as one cause.',evidence:['38 invoices in the draft investigation','34 cut-off invoices: AED 412,000','4 branch-allocation invoices: AED 74,200','Dubai adjustment: +AED 486,200','Abu Dhabi adjustment: −AED 74,200'],agents:['Load return-box and reconciliation guidance','Retrieve invoice, return and ledger evidence','Use tools for the box-by-box calculations','Draft an inspector request or business reply','Explain the adjustment without double counting'],action:['Preview and approve the demo disclosure','Apply the agreed return-box changes','Reconcile the new return against invoices','Show one case history in both role views','Return actual status, including partial resolution'],branches:['A net correction can still leave an Emirate allocation unresolved; check both.','Explanation-only, no reply, more-time and audit branches need explicit permitted transitions.']},
{tag:'SCENARIO 4 / MISSING DISCLOSURE',title:'Al Saqr: allocate the invoices to the correct period and count VAT once',sub:'The draft identifies September supplies invoiced after the Q3 filing and included in the Q4 draft.',evidence:['11 invoices: AED 162,400 VAT','Supply, issue, ledger and filing dates','Q3 Box 1c: 318,600 → 481,000','Q4 draft: 402,900 → 240,500','Applicable deadline from an approved rule tool'],agents:['Load period-allocation and disclosure sections','Explain which dates drive the classification','Prepare Q3 changes and the Q4 adjustment','Draft reminder / response with source invoices','Identify contradictions rather than accepting a claim'],action:['Visitor approves the proposed changes','Submit the demo disclosure','Remove the same items from the Q4 draft','Verify the combined VAT is counted once','Record submission status and any open review'],branches:['An alternative period claim must be checked against evidence and approved policy.','Do not let an LLM independently invent legal deadlines, penalties or the filing obligation.']}
]);

// 07. Concrete engineering deliverables and acceptance checks.
{
const f=page('learn-07-build-test','What you build and how you prove it works','Start with one complete vertical slice, then reuse the contracts and workflows across the remaining stories.',1320);
const stages=[
['1 / DEFINE THE CONTRACTS',['Agree role scope, scenario state and data IDs','Get approved business rules and reference totals'],['Outputs: data dictionary; tool input/output schemas','Test: every displayed figure has an authoritative source']],
['2 / BUILD ONE SCENARIO',['Implement section loading, agents and deterministic tools','Use Scenario 2 as a proposed first complete example'],['Outputs: query → calculation → evidence → explanation','Test: AED 412,000 net gap and each box adjustment match']],
['3 / ADD APPROVED ACTIONS',['Connect previews to demo APIs and persistent case state','Reconcile after submission; simulate follow-up events'],['Outputs: approval record; operation ID; shared history','Test: cancel does nothing; repeated approval does not duplicate']],
['4 / REUSE AND EXTEND',['Add invoice, refund and period-allocation configurations','Expose the same engine through Inspector and Business'],['Outputs: scenario sections; approved action options','Test: both views agree; company boundaries remain enforced']],
['5 / REHEARSE AND OPERATE',['Deploy on the agreed Cloudera environment and model','Trace latency, tool errors and evidence quality; rehearse reset'],['Outputs: deployment settings; evaluation report; demo runbook','Test: timeout, missing evidence, role switch and session reset']]
];
stages.forEach((s,i)=>{const y=216+i*192;f.eyebrow(64,y,s[0]);f.lines(64,y+40,s[1],{size:18,leading:32});f.rect(`deliverable-${i}`,864,y-4,672,128,{fill:i===1?T.accentTint:T.paper2,stroke:i===1?T.accent:T.rule});f.lines(888,y+40,s[2],{size:16,leading:32});if(i<4)f.path(`stage-${i}`,[[480,y+100],[480,y+160]]);f.rule(64,y+164,1536,y+164);});
footer(f,1288,'This is an implementation sequence, not a committed schedule. Feasibility depends on the deadline, people, data and platform readiness.');f.save();
}

fs.writeFileSync(path.join(dir,'learning-guide-manifest.json'),JSON.stringify(pages,null,2));
console.log(JSON.stringify(pages.map(p=>p.slug)));
