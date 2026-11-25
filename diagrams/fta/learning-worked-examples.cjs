// Concrete teaching examples: draft figures, proposed interfaces, no live operations.
const examples = {
 'learn-01-system': {
  title: 'One question travelling through the whole system',
  question: 'Al Yasmeen asks: “Why is my return different from the invoice records?”',
  takeaway: 'You connect the language model to reliable records and approved workflows; the platform alone does not supply the business logic.',
  rows: [
   ['Business user', 'Opens Al Yasmeen’s selected return case and asks the question.', 'A question linked to the selected company and case.'],
   ['Application backend', 'Attaches the permitted company, user role and selected period. It takes these from the application session.', 'Trusted scope. Typing another company name cannot grant access.'],
   ['Supervisor Agent', 'Loads approved reconciliation instructions, then plans: get records, calculate differences, check evidence, explain.', 'A bounded task list with permitted tools and required evidence.'],
   ['Data + Calculation', 'Data workflow retrieves permitted records. Calculation tool compares expected VAT with declared VAT.', 'Dubai +486,200; Abu Dhabi −74,200; net +412,000 AED.'],
   ['Explanation workflow', 'Uses the returned figures and invoice references to explain the 34 cut-off and 4 allocation invoices.', 'A plain-language explanation with links to its supporting records.'],
   ['Application + platform', 'The configured model endpoint supplies language generation; the app displays the answer and saves the case history.', 'The visitor sees the answer. Shared case state survives a role switch.']
  ]
 },
 'learn-02-instructions': {
  title: 'Exactly what the agent reads before answering',
  question: 'Same Al Yasmeen case: “Explain the difference and tell me what needs correcting.”',
  takeaway: 'The section file tells the agent how to investigate; the invoice and return records tell it what happened in this case.',
  rows: [
   ['Domain owner + you', 'Prepare a reconciliation section: compare by Emirate, use the calculation tool, cite invoice IDs and never invent missing evidence.', 'A reviewed, versioned plain-language file. The owner approves its meaning.'],
   ['Instruction loader', 'Selects that approved section for this case and passes it to the supervisor before the plan is built.', 'The supervisor receives task instructions, not raw implementation code.'],
   ['Supervisor Agent', 'Plans the work using the section’s rules. Each specialist receives the relevant section before running its task.', 'Read records → calculate → check evidence → explain. No submission yet.'],
   ['Data + Calculation', 'Retrieves the company’s return and invoice records, then applies the approved comparison formula.', 'Case evidence: 38 invoices; box changes +486,200 and −74,200 AED.'],
   ['Knowledge workflow', 'If the answer makes a policy statement, retrieves the applicable approved reference passage with its version and citation.', 'Supporting reference text. It does not replace the case-specific figures.'],
   ['Explanation workflow', 'Combines the instructions, tool results and references. Says what is supported and flags any missing evidence.', '“The net gap is AED 412,000.” It cannot claim a model cause without prediction evidence.']
  ]
 },
 'learn-03-reconciliation': {
  title: 'A worked investigation with actual draft arithmetic',
  question: 'The user asks: “Is the full AED 486,200 Dubai difference extra VAT?”',
  takeaway: 'A good agent separates the net shortfall from a movement between boxes. Repeating one large number would give the wrong explanation.',
  rows: [
   ['Supervisor Agent', 'Recognizes a reconciliation question. Loads instructions and asks the Data workflow for the selected return and its invoice evidence.', 'A scoped investigation. The question itself is not treated as proof.'],
   ['Data workflow', 'Reads Dubai expected VAT 1,626,200 and declared VAT 1,140,000; Abu Dhabi expected 214,600 and declared 288,800.', 'Four source-backed amounts, with their period, currency and record IDs.'],
   ['Calculation tool', 'Subtracts declared from expected for each Emirate: 1,626,200 − 1,140,000; 214,600 − 288,800.', 'Dubai +486,200; Abu Dhabi −74,200. These are signed adjustments.'],
   ['Investigation task', 'Checks the invoice breakdown: 34 cut-off invoices account for 412,000; 4 allocation invoices account for 74,200.', '38 supporting invoices. Allocation changes move VAT between Emirate boxes.'],
   ['Calculation tool', 'Adds the signed box adjustments: 486,200 + (−74,200). Checks that the invoice breakdown reconciles.', 'Net extra VAT in the draft: AED 412,000. The allocation is not counted twice.'],
   ['Explanation workflow', 'Answers: “Dubai increases by 486,200, but Abu Dhabi decreases by 74,200. The net increase is 412,000.” Offers an action preview.', 'A checkable answer and an optional draft. Nothing is submitted by this answer.']
  ]
 },
 'learn-04-actions': {
  title: 'From “please fix it” to a verified demo correction',
  question: 'After reading the explanation, the Al Yasmeen user says: “Prepare the correction.”',
  takeaway: 'The agent may prepare a change; the backend controls whether the exact approved change may execute and whether it actually succeeded.',
  rows: [
   ['Action workflow', 'Prepares the demo disclosure using the supported changes: Dubai +486,200; Abu Dhabi −74,200; net +412,000.', 'Preview v1: company, case, affected boxes, amounts and evidence references.'],
   ['Human user', 'Reviews the exact preview and selects Approve. If the user edits it, the edited version needs fresh approval.', 'An approval record tied to preview v1. Cancel produces no submission.'],
   ['Backend execution', 'Checks role, company scope, current record version and approval. Sends the approved request to the demo submission API.', 'One operation ID. A changed record blocks execution until the preview is refreshed.'],
   ['Status tool', 'If the request times out, checks that operation’s status before trying again. Reuses its unique operation key.', 'The same correction is not submitted twice after a retry or double click.'],
   ['Reconciliation tool', 'Reads the resulting return and checks both Emirate boxes and the invoice evidence against the expected state.', 'Verified correction, or a specific remaining difference with a pending/failed status.'],
   ['Case engine + UI', 'Records the outcome and shows the same event history in Business and Inspector views. Advances simulated follow-up events when needed.', 'Both roles agree on the case status. “Closed” requires the closure checks to pass.']
  ]
 },
 'learn-05-invoice-refund': {
  title: 'Two user conversations with concrete outcomes',
  question: 'Invoice: “Why was it flagged?” Refund: “Why can’t the full claim be supported yet?”',
  takeaway: 'Reuse the same agent building blocks, but change the instruction sections, evidence tools and permitted action for each business task.',
  rows: [
   ['Invoice / Data', 'Najmat asks about its selected invoice. Retrieve the lines and configured checks: net 36,500, VAT charged 525, expected VAT 1,825.', 'Evidence shows a draft VAT difference of AED 1,300. Formatting can still be valid.'],
   ['Invoice / Explain', 'Load invoice guidance and explain the affected lines using the actual check findings. Show the arithmetic: 1,825 − 525.', '“The configured checks expect AED 1,300 more VAT.” Show which lines support it.'],
   ['Invoice / Act', 'Draft a credit note and replacement invoice. After approval, send through the illustrative seller app and check the received correction records.', 'Report corrected only after revalidation. If delivery or checks fail, keep the case open.'],
   ['Refund / Data', 'Al Waha asks about its 284,600 claim. Retrieve initial support of 53,600 and pending evidence for the remaining 231,000.', 'Pending breakdown: 184,200 needs invoice evidence; 46,800 has a supplier issue.'],
   ['Refund / Investigate', 'Review the supplied evidence using approved guidance. It supports another 150,000; 34,200 remains unsupported and is corrected.', 'Supported total: 53,600 + 150,000 = AED 203,600.'],
   ['Refund / Recommend', 'Prepare the demo recommendation: supported 203,600; corrected/not approved 34,200; held 46,800. Record the approved outcome.', 'The three amounts total 284,600. The supplier case remains open; the review can be complete.']
  ]
 },
 'learn-06-return-disclosure': {
  title: 'Two corrections where getting the total right is not enough',
  question: 'Reconciliation: “Can I just add 412,000?” Disclosure: “Why adjust both Q3 and Q4?”',
  takeaway: 'Verify the correct boxes and periods as well as the final number. Correct tax counted in the wrong place is still an unresolved finding.',
  rows: [
   ['Return / Investigate', 'Al Yasmeen proposes adding 412,000 only to Dubai. Retrieve the 34 cut-off and 4 allocation invoice findings before accepting the proposal.', 'The net amount is plausible, but the suggested change misses the Emirate allocation.'],
   ['Return / Calculate', 'Apply the approved box-level definition: Dubai increases by 486,200 and Abu Dhabi decreases by 74,200.', 'Net +412,000 and the correct allocation. Both must reconcile.'],
   ['Return / Act', 'Preview the box changes, obtain approval, submit the demo correction and compare the resulting boxes to invoice evidence.', 'Close only the resolved findings; retain any remaining allocation discrepancy.'],
   ['Disclosure / Investigate', 'Al Saqr asks about 11 invoices with 162,400 VAT. Retrieve supply, issue and filing dates and the Q4 draft entries.', 'Draft evidence places the supplies in September; the same items are also in Q4.'],
   ['Disclosure / Calculate', 'Using the approved period rule, prepare Q3 Box 1c: 318,600 + 162,400; Q4 draft: 402,900 − 162,400.', 'Q3 becomes 481,000. Q4 becomes 240,500. Combined total remains 721,500.'],
   ['Disclosure / Act', 'Show both changes for approval, submit the demo disclosure and verify the same invoice IDs are removed from the Q4 draft.', 'The affected VAT is allocated to the intended period and counted once across Q3 and Q4.']
  ]
 },
 'learn-07-build-test': {
  title: 'What you would actually build as the junior AI engineer',
  question: 'Your first assignment: “Make the Al Yasmeen question work from input to verified output.”',
  takeaway: 'Begin with one working path and known expected results. Add failure cases and reuse the tested building blocks for the other scenarios.',
  rows: [
   ['You + data owner', 'Ask for the synthetic return and invoice records, stable IDs, permitted scope and expected box adjustments. Agree the tool response format.', 'A small reference dataset and a written input/output contract, not just screenshots.'],
   ['You + domain owner', 'Write the reconciliation instruction section. Implement a read-only data tool and a deterministic calculation tool with approved definitions.', 'Example tool result: Dubai +486,200; Abu Dhabi −74,200; net +412,000; source IDs.'],
   ['You / orchestration', 'Configure the supervisor to load instructions, delegate the data/calculation work and return the evidence to an explanation task.', 'The question produces a supported explanation. Traces show which tools and sections were used.'],
   ['You + backend team', 'Connect the action preview, approval record, demo submission API and persistent case history. Add post-submission verification.', 'A complete demo path: ask → explain → preview → approve → submit → verify.'],
   ['You / evaluation', 'Check the known amounts; ask for another company; remove an evidence record; cancel approval; submit twice; simulate a timeout.', 'Correct figures; access blocked; missing evidence stated; no cancelled or duplicate effect.'],
   ['You + platform team', 'Connect the agreed model endpoint and governed data access on Cloudera. Rehearse both roles and the session reset, then reuse the workflow.', 'A repeatable demo with measured errors and latency. No new ML training is needed just to subtract these amounts.']
  ]
 }
};

function wrap(text, max) {
 const lines=[]; let line='';
 for(const word of text.split(' ')) { if(line && (line+' '+word).length>max){lines.push(line);line=word;}else line+=(line?' ':'')+word; }
 if(line)lines.push(line); return lines;
}

function appendWorkedExample(f,T) {
 const e=examples[f.slug]; if(!e)return;
 const y=f.height+24;
 const start=y+188, rowH=120;
 f.height=start+e.rows.length*rowH+142;
 f.rect('worked-example-heading',64,y,1472,132,{fill:T.accentTint,stroke:T.accent},'zones');
 f.eyebrow(88,y+28,'WORKED EXAMPLE / READ FROM TOP TO BOTTOM');
 f.text(88,y+64,e.title,{size:26,weight:600});
 f.text(88,y+102,e.question,{size:18});
 f.eyebrow(88,start-18,'STEP / WHO ACTS');
 f.eyebrow(360,start-18,'WHAT THEY ACTUALLY DO');
 f.eyebrow(1032,start-18,'WHAT COMES BACK / WHY IT MATTERS');
 e.rows.forEach((r,i)=>{
  const top=start+i*rowH;
  f.rect('worked-row-'+i,64,top,1472,rowH,{fill:i%2?T.paper:T.paper2,stroke:T.rule,radius:0},'zones');
  f.text(88,top+35,String(i+1).padStart(2,'0'),{size:22,weight:600,color:T.accent});
  f.lines(136,top+34,wrap(r[0],22),{size:18,weight:600,leading:25});
  f.lines(360,top+32,wrap(r[1],67),{size:17,leading:25});
  f.lines(1032,top+32,wrap(r[2],48),{size:17,leading:25,color:T.muted});
 });
 const bottom=start+e.rows.length*rowH;
 f.text(64,bottom+42,'What to remember',{size:21,weight:600});
 f.lines(64,bottom+74,wrap(e.takeaway,151),{size:17,leading:25});
 f.text(64,f.height-20,'Worked examples use the supplied synthetic draft. Tool behavior and interfaces are proposed; these are not live taxpayer operations.',{size:14,color:T.muted});
}
module.exports={appendWorkedExample};
