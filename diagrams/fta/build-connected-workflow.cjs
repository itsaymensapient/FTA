const fs=require('fs'),path=require('path');
const {Figure}=require('./build-editorial.cjs');
const T=require('./diagram-tokens.json');
const f=new Figure('fta-connected-models-agents',1600,1680,'Connected models and agents for interactive FTA journeys','One supervisor, a shared language-model endpoint, controlled specialist tools and durable per-company case state for Scenarios 2, 3 and 4.');
f.heading('Connect the agents through one shared workflow','Scenarios 2, 3 and 4 reuse the same components; every company and case keeps its own authorized context.','INTERACTIVE / CONNECTED DESIGN');
const box=(id,x,y,w,h,title,body,accent=false)=>f.box(id,x,y,w,h,title,body,{titleSize:23,bodySize:17,fill:accent?T.accentTint:T.paper2,stroke:accent?T.accent:T.rule});
box('user',64,224,928,100,'User interface — one ongoing conversation',[
 'Questions, choices, supporting documents, edits and exact-payload approvals'
]);
box('instructions',1104,224,432,112,'Ali’s approved section files',[
 'Select the relevant scenario/task sections',
 'Load before planning and specialist work'
]);
box('supervisor',64,448,928,208,'Supervisor + validated workflow controller',[
 'Resolve trusted role/company/case; load the applicable instruction versions',
 'Plan → validate → dispatch specialist tasks → check their evidence/results',
 'Ask the user for missing information or a decision; persist the current stage',
 'Resume the correct step after a reply, document upload or approved action',
 'Specialists return results here; they do not independently call each other'
],true);
box('llm',1104,448,432,208,'Shared LLM endpoint',[
 'Planning, language and interpretation',
 'Separate role prompts and task context',
 'Supervisor and specialists reuse it',
 'No new model is needed for each role',
 'Model output is checked before use'
]);
f.path('user-request',[[384,324],[384,448]]);
f.label(384,380,'QUESTION / REPLY',{size:12});
f.path('user-response',[[608,448],[608,324]]);
f.label(608,412,'RESULT / NEXT CHOICE',{size:12});
f.path('load-instructions',[[1104,280],[1040,280],[1040,400],[864,400],[864,448]]);
f.label(952,384,'LOAD FIRST',{size:12});
f.path('llm-request',[[992,520],[1104,520]]);
f.label(1048,502,'MODEL CALL',{size:11});
f.path('llm-result',[[1104,584],[992,584]],{dash:true});
f.label(1048,568,'DRAFT RESULT',{size:11});

f.rect('specialists',64,848,928,360,{fill:T.paper,stroke:T.rule},'zones');
f.text(88,886,'Specialist tasks + their controlled tools',{size:25,weight:600});
const rows=[
 ['Data + calculation','Scoped Gold queries and deterministic arithmetic', 'Return records, signed amounts, source IDs and formula versions.'],
 ['Knowledge / reference','Approved passage lookup; semantic search if needed', 'Return applicable references and citations, not new permissions.'],
 ['Investigation + explanation','Compare evidence, find gaps and explain findings', 'Return a supported answer, unresolved points and the next options.'],
 ['Action workflow','Preview → approval checks → demo API → verification', 'Return a draft or actual operation status; never infer success.']
];
rows.forEach((r,i)=>{const y=928+i*68;f.text(88,y,r[0],{size:19,weight:600});f.text(400,y,r[1],{size:17});f.text(400,y+26,r[2],{size:16,color:T.muted});if(i<3)f.rule(88,y+40,968,y+40);});
f.path('dispatch',[[384,656],[384,848]]);
f.label(384,732,'SCOPED TASK + GUIDANCE',{size:12});
f.path('collect',[[608,848],[608,656]],{dash:true});
f.label(608,792,'TYPED RESULT + EVIDENCE',{size:12});
f.text(1104,740,'How the shared model works',{size:24,weight:600});
f.lines(1104,780,[
 'The runtime invokes the LLM for each',
 'language-based task with its own context.',
 'Tools establish facts and perform effects.',
 'Optional embedding or ML endpoints are',
 'added only for a defined retrieval or',
 'prediction requirement—not by default.'
],{size:17,leading:29});
box('state',1104,1104,432,192,'Durable case state',[
 'Company ID + case ID + record version',
 'Current stage and pending user decision',
 'Evidence, answers and instruction versions',
 'Approved payload + operation status',
 'Supervisor owns the state transitions'
]);
f.path('persist',[[992,624],[1040,624],[1040,1200],[1104,1200]]);
f.label(1040,1040,'SAVE / RESUME',{size:11});

f.text(64,1360,'One interactive journey, rather than independent answers',{size:28,weight:600});
f.lines(64,1404,[
 'Start → investigate → ask/review evidence → explain → preview → approve → execute → verify → follow up.',
 'A reply can return the case to investigation. A changed preview needs fresh approval. A pending operation stays pending.',
 'Every handoff carries: case + trusted scope + task + instruction versions + evidence references + expected next step.'
],{size:18,leading:34});
f.rect('scope-note',64,1536,1472,80,{fill:T.accentTint},'zones');
f.text(88,1568,'Scenario 2: reconciliation   ·   Scenario 3: refund evidence   ·   Scenario 4: disclosure and period allocation',{size:20,weight:600});
f.text(88,1596,'Same workflow engine, different approved instructions and tools. Scenario 5 remains optional until its interaction is defined.',{size:17});
f.rule(64,1640,1536,1640);f.text(64,1666,'Proposed wiring, not a live deployment. Shared components do not imply shared taxpayer data or automatic approval.',{size:14,color:T.muted});
f.save();

const md=`# Connected FTA models and agents

Proposed design for interactive Scenarios 2, 3 and 4. Scenario 5 is optional and not yet defined.

## What is connected

One supervisor coordinates the user journey, specialist tasks, model calls and case state. Start with one suitable language-model endpoint reused across roles. Separate role instructions and scoped task context matter more than deploying a different model for every agent.

All specialist outputs go back to the supervisor. A result envelope should contain case ID, task ID, completion status, evidence references, findings, instruction/formula versions and remaining questions. These are proposed application contracts, not a native Cloudera API schema.

The supervisor must validate scope and dependencies before execution. Tools enforce access. A shared service account does not by itself enforce visitor-specific company boundaries.

## How scenarios reuse the components

| Scenario | Evidence and calculations | User interaction | Controlled action |
| --- | --- | --- | --- |
| 2 — Al Yasmeen | Return, invoice and ledger evidence; Emirate reconciliation | Ask about the discrepancy, review invoices, dispute or accept findings, review proposed changes | Approve demo correction, submit, verify both boxes and the net result |
| 3 — Al Waha | Claim breakdown, document evidence, supplier-related status | Supply evidence, answer questions, review supported/corrected/held components | Prepare an authorized recommendation/action; track the supplier issue separately |
| 4 — Al Saqr | Supply/issue/filing dates, invoice IDs, Q3 and Q4 records | Review period reasoning, provide contrary evidence, inspect both proposed changes | Approve demo disclosure/period changes, verify VAT is counted once |

Sharing components does not mean combining these companies' case records. Every run and retrieved passage/result remains scoped to the permitted company and case.

## A concrete connected conversation: Scenario 2

1. User: Explain my return mismatch. The application supplies trusted case/company scope.
2. Supervisor loads Ali's reviewed reconciliation sections before creating and validating the plan.
3. Data tool retrieves permitted return and invoice evidence. Calculation tool produces Dubai +486,200; Abu Dhabi -74,200; net +412,000 AED. These are synthetic draft figures.
4. Investigation checks supporting records. If evidence is missing, the supervisor requests it and saves WAITING_FOR_EVIDENCE.
5. Explanation task uses the shared LLM with approved instructions and actual tool results. The user can ask for the invoice list or dispute an item without losing the case stage.
6. Action workflow prepares the exact changes. The case becomes WAITING_FOR_APPROVAL, not completed.
7. The user approves the displayed payload version. The backend rechecks authority and freshness, then executes one demo operation using a unique operation key.
8. The verification tool reads the resulting records. The case becomes VERIFIED, PENDING or NEEDS_REVIEW according to recorded evidence and approved transition rules.

## Model responsibilities

- Primary LLM: planning proposals, language understanding, evidence interpretation and explanations. The application validates its outputs.
- Embedding model: optional, only for semantic document retrieval. Its vectors do not establish case facts or replace SQL.
- Predictive ML model: optional, only if a scenario needs a real prediction. Preserve the actual prediction evidence and approved interpretation mappings. Do not invent an ML cause for a deterministic discrepancy.
- Calculation/rule engine: ordinary tested code, not a language model doing arithmetic.

## Hosting connection to the previous design

The proposed Cloudera hosting map remains the application/workflow runtime plus the chosen LLM endpoint, governed Gold connection and backend case/action services. This artifact defines the application wiring; it does not create endpoints, credentials or a live integration. See FTA-Cloudera-agent-hosting-guide.html for the checked vendor references and release constraints.
`;
fs.writeFileSync(path.join(__dirname,'FTA-connected-workflow-explained.md'),md);
console.log('Created connected workflow diagram and explanation.');
