const {Figure}=require('./build-editorial.cjs');
const T=require('./diagram-tokens.json');

const r=new Figure('gitex-ai-engineer-role',1600,1056,'Your AI engineering role in the FTA demonstration','A proposed ownership map shows how approved domain rules, data and application interfaces feed the agent layer you build and evaluate, then deploy on Cloudera.');
r.heading('Your job: make the agents work reliably','Proposed responsibility split for the GITEX PoC. Confirm named owners and interfaces on the call.','YOUR ROLE');
r.rule(64,204,1536,204); r.rule(64,372,1536,372);r.rule(64,540,1536,540);r.rule(64,780,1536,780);r.rule(64,948,1536,948);
r.rect('your-lane',64,540,1472,240,{fill:T.accentTint,stroke:T.accent},'zones');
r.eyebrow(88,244,'FTA / DOMAIN OWNERS');
r.lines(88,280,['Approve the meaning','of rules and decisions'],{size:16,color:T.muted});
r.box('approved-policy',320,236,352,96,'Approved rules + guidance',['Tax interpretation, options and wording','Reviewed plain-language section files'],{titleSize:20,bodySize:14});
r.eyebrow(88,412,'DATA + APPLICATION TEAM');
r.lines(88,448,['Provide records and','operational interfaces'],{size:16,color:T.muted});
r.box('data-inputs',320,404,352,96,'Data + evidence contracts',['Invoices, returns, ledger and documents','Verified totals, identifiers and scope'],{titleSize:20,bodySize:14});
r.box('application-inputs',960,404,448,96,'Demo action + case interfaces',['Drafts, approvals, submissions and case state','Shared history across Inspector and Business'],{titleSize:20,bodySize:14});
r.eyebrow(88,584,'YOU / AI ENGINEER');
r.lines(88,624,['Build agent behavior,','tool integration and','evidence-based answers.'],{size:16,color:T.ink});
r.box('instructions-tools',320,588,352,112,'Instructions + scoped tools',['Load approved sections before tasks','Query, calculate and retrieve evidence'],{titleSize:20,bodySize:14});
r.box('agent-workflows',768,588,352,112,'Supervisor + specialists',['Plan, explain, investigate and draft','Coordinate approved actions and follow-up'],{titleSize:20,bodySize:14});
r.box('quality',1216,588,296,112,'Evaluate + trace',['Correct figures and explanations','Access, failures and repeat actions'],{titleSize:20,bodySize:14});
r.path('rules-to-instructions',[[320,284],[288,284],[288,644],[320,644]]);
r.path('data-to-tools',[[552,500],[552,588]]);
r.path('backend-to-agents',[[1184,500],[1184,532],[992,532],[992,588]]);
r.path('tools-to-orchestration',[[672,644],[768,644]]);
r.path('orchestration-to-quality',[[1120,644],[1216,644]]);
r.eyebrow(88,820,'CLOUDERA / PLATFORM TEAM');
r.lines(88,856,['Provide the runtime,','models and connectivity'],{size:16,color:T.muted});
r.box('cloudera',768,820,744,96,'Run the application on Cloudera',['Workbench development; agent orchestration; model serving; governed connections','Exact services and release support to be confirmed with the platform team'],{titleSize:20,bodySize:15});
r.path('deploy',[[992,700],[992,820]]);
r.label(1056,760,'DEPLOY');
r.text(64,988,'Your delivery: agent workflows + instruction loading + tool adapters + validation + evaluations.',{size:20,weight:600});
r.text(64,1024,'Domain approval, data preparation, backend state and platform provisioning are shared dependencies.',{size:16,color:T.muted});
r.save();

const s=new Figure('gitex-scenarios-agent-workflow',1600,1152,'How agents solve the four GITEX scenarios','A shared approved-guidance and tool-based workflow supports four synthetic tax scenarios, with human approval before demo actions and recorded follow-up.');
s.heading('One agent system, four demonstration stories','Rules and tools establish facts. Agents explain and coordinate. People approve actions.','SCENARIO IMPLEMENTATION');
s.box('guidance',64,220,320,112,'1  Load approved guidance',['Domain and scenario sections','Role, company and permitted scope'],{titleSize:20,bodySize:15,stroke:T.accent,fill:T.accentTint});
s.box('supervisor',480,220,448,112,'2  Supervisor plans the task',['Select data, calculation, explanation and knowledge work','Validate the plan and schedule dependencies'],{titleSize:20,bodySize:15});
s.box('tools',1088,220,448,112,'3  Execute scoped tools',['Query Gold; run certified rules and calculations','Retrieve records and approved evidence descriptions'],{titleSize:20,bodySize:15});
s.box('validation',1088,436,448,112,'4  Validate and investigate',['Reconcile amounts, documents and periods','Identify gaps; request further evidence when needed'],{titleSize:20,bodySize:15});
s.box('approval',480,436,448,112,'5  Draft + human approval',['Explain options and prepare letters or corrections','Show the exact action before Send or Submit'],{titleSize:20,bodySize:15,stroke:T.accent,fill:T.accentTint});
s.box('action',64,436,320,112,'6  Act + follow up',['Execute against the demo backend','Record status and verify the outcome'],{titleSize:20,bodySize:15});
s.path('guide-to-plan',[[384,276],[480,276]]);
s.path('plan-to-tools',[[928,276],[1088,276]]);
s.path('tool-to-validation',[[1312,332],[1312,436]]);
s.path('validation-to-draft',[[1088,492],[928,492]]);
s.path('approved-to-action',[[480,492],[384,492]]);
s.label(432,472,'APPROVED');
s.text(64,592,'The workflow state survives role switching. Future replies use a controlled demo clock and recorded events.',{size:16,color:T.muted});
s.eyebrow(64,652,'SCENARIO CONFIGURATION / REUSE THE SAME ENGINE');
const cols=[64,352,768,1216];
['DEMO STORY','FACTS / TOOL CHECKS','WHAT THE AGENTS DO','VERIFIABLE OUTCOME'].forEach((v,i)=>s.eyebrow(cols[i],692,v));
s.rule(64,712,1536,712);
const rows=[
 ['1  Live e-invoice',['Selected lines, buyer registration,','configured VAT checks and totals'],['Explain flags; prepare the correction','documents and proposed next step'],['Approved correction arrives','and is checked again']],
 ['2  Return mismatch',['Invoice / ledger / return reconciliation','Draft target: AED 412,000 net gap'],['Trace the affected records; explain the','difference; draft a request or disclosure'],['Stored changes reconcile;','both role views agree']],
 ['3  Refund evidence',['Match claim amounts to invoices,','documents and supplier evidence'],['Identify missing support; request','documents; draft a supported recommendation'],['Approved, rejected and','pending amounts stay distinct']],
 ['4  Missing disclosure',['Supply / issue / filing dates;','period allocation and duplicate checks'],['Explain the period; prepare the','disclosure and Q4 draft adjustment'],['The relevant VAT is','counted once']]
];
rows.forEach((a,i)=>{const y=752+i*84;s.text(cols[0],y,a[0],{size:20,weight:600});for(let c=1;c<4;c++)s.lines(cols[c],y,a[c],{size:15,leading:24,color:T.muted});s.rule(64,y+52,1536,y+52);});
s.text(64,1112,'Demo acceptance: traceable numbers, supported explanations, enforced scope, approved actions and consistent case state.',{size:16,color:T.ink});
s.save();
console.log('Created AI engineer ownership and scenario workflow diagrams.');
