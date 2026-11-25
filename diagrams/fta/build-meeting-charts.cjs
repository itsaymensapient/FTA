/**
 * Meeting chart pack: Scenario v2.9 + Data Model v1.2
 * Skills used: diagram-design (authoring) + FTA diagram-tokens +
 * visualize references (hierarchy / short labels) + existing build-editorial Figure API.
 * Synthetic demo figures only. Proposed stand design — not a live system.
 */
const fs = require('fs');
const path = require('path');
const { Figure } = require('./build-editorial.cjs');
const T = require('./diagram-tokens.json');

const dir = __dirname;
const pages = [];

function page(slug, title, sub, height) {
  const f = new Figure(slug, 1600, height, title, sub);
  f.heading(title, sub, 'GITEX / MEETING · 25 NOV 2026');
  // Override right-side date stamped in heading
  pages.push({ slug, title, sub });
  return f;
}

function footer(f, y, text) {
  f.rule(64, y - 24, 1536, y - 24);
  f.text(64, y, text, { size: 15, color: T.muted });
}

function block(f, x, y, w, h, title, lines, accent) {
  f.box(
    title.replace(/\W+/g, '-').toLowerCase(),
    x,
    y,
    w,
    h,
    title,
    lines,
    {
      titleSize: 20,
      bodySize: 15,
      fill: accent ? T.accentTint : T.paper,
      stroke: accent ? T.accent : T.rule,
      width: accent ? 1.5 : 1.25,
    }
  );
}

// ---------------------------------------------------------------------------
// 01 — How the two files fit
// ---------------------------------------------------------------------------
{
  const f = page(
    'meet-01-two-files',
    'Two files, one stand',
    'Scenario v2.9 is the visitor script. Data Model v1.2 is the seed data, rules and tools behind it.',
    980
  );
  f.eyebrow(64, 188, 'A  WHAT EACH FILE IS');
  block(f, 64, 220, 704, 200, 'Scenario v2.9 EN — the script', [
    'Roles: FTA Specialist · Business',
    'Six steps on every case',
    'Two cases + free-query open question',
    'What the visitor sees and clicks',
  ], true);
  block(f, 832, 220, 704, 200, 'Data Model v1.2 — the stockroom', [
    '21 tables + field dictionary',
    'Rules R01–R13 (numbers in code)',
    'AgentTools the AI must call',
    'Checks: expected demo totals',
  ], false);
  f.path('files-link', [[768, 320], [832, 320]], { color: T.accent });
  f.label(800, 300, 'PAIRED', { color: T.accent });

  f.eyebrow(64, 460, 'B  HOW THEY FIT AT RUNTIME');
  const laneY = 500;
  const lanes = [
    ['Visitor UI', ['Name · role · case screens', 'Six-step tracker'], false],
    ['AI agent', ['Explains · recommends · drafts', 'Calls named tools only'], true],
    ['CDP + case store', ['Findings · invoices · returns', 'Rules own every figure'], false],
    ['Person', ['Send · Submit · Close', 'Nothing leaves without this'], false],
  ];
  lanes.forEach((L, i) => {
    const x = 64 + i * 380;
    block(f, x, laneY, 360, 160, L[0], L[1], L[2]);
    if (i < 3) f.path(`lane-${i}`, [[x + 360, laneY + 80], [x + 380, laneY + 80]]);
  });
  f.text(64, 720, 'Core rule', { size: 22, weight: 600 });
  f.text(
    64,
    756,
    'CDP / rules produce numbers. The agent writes plain language from tool results. People decide.',
    { size: 17 }
  );
  footer(
    f,
    920,
    'Stand design from Scenario v2.9 and Data Model v1.2. Synthetic data. Not a live FTA deployment.'
  );
  f.save();
}

// ---------------------------------------------------------------------------
// 02 — Scenario journey
// ---------------------------------------------------------------------------
{
  const f = page(
    'meet-02-scenario-journey',
    'Scenario v2.9 — roles, steps, two cases',
    'One shared journey. Specialist and Business see the same facts from opposite sides.',
    1080
  );
  f.eyebrow(64, 188, '01  ENTRY');
  block(f, 64, 220, 360, 112, 'Name entry', ['Visitor types a greeting name'], false);
  block(f, 464, 220, 360, 112, 'Role choice', ['FTA Specialist or Business'], true);
  block(f, 864, 220, 672, 112, 'Then', [
    'Specialist → risk-ordered briefing (2 events)',
    'Business → choose Al Yasmeen or Al Waha',
  ], false);
  f.path('e1', [[424, 276], [464, 276]]);
  f.path('e2', [[824, 276], [864, 276]]);

  f.eyebrow(64, 372, '02  SIX STEPS (BOTH ROLES)');
  const steps = [
    ['1 Check', 'Open issue'],
    ['2 Explain', 'Evidence'],
    ['3 Decide', 'Options'],
    ['4 Act', 'Draft'],
    ['5 Follow-up', 'Verify'],
    ['6 Done', 'Close'],
  ];
  steps.forEach((s, i) => {
    const x = 64 + i * 248;
    f.rect(`step-${i}`, x, 408, 228, 96, {
      fill: i === 1 || i === 3 ? T.accentTint : T.paper,
      stroke: i === 1 || i === 3 ? T.accent : T.rule,
    });
    f.text(x + 16, 444, s[0], { size: 19, weight: 600 });
    f.text(x + 16, 476, s[1], { size: 14, color: T.muted });
    if (i < 5) f.path(`s-${i}`, [[x + 228, 456], [x + 248, 456]]);
  });

  f.eyebrow(64, 544, '03  THE TWO STAND CASES');
  block(f, 64, 580, 720, 200, 'Case 1 · Al Yasmeen', [
    'VAT return does not match e-invoices',
    'Net gap AED 412,000',
    'Dubai +486,200 · Abu Dhabi −74,200',
    'Fix: VD correcting both boxes',
  ], true);
  block(f, 816, 580, 720, 200, 'Case 2 · Al Waha', [
    'Refund not fully supported',
    'Claim AED 284,600',
    'Approve 203,600 · reject 34,200 · hold 46,800',
    'Bright Line non-filer stays open',
  ], false);
  f.text(64, 820, 'Also: free query (open policy)', { size: 18, weight: 600 });
  f.text(
    64,
    856,
    'Typed questions only if every figure comes from data; otherwise suggested questions. Extra analytics examples are not fully seeded in v1.2.',
    { size: 16, color: T.muted }
  );
  footer(f, 1040, 'Figures from Scenario v2.9 / Data Model Checks. Synthetic demonstration amounts.');
  f.save();
}

// ---------------------------------------------------------------------------
// 03 — Data model map
// ---------------------------------------------------------------------------
{
  const f = page(
    'meet-03-data-model',
    'Data Model v1.2 — what builders open',
    'Entities feed tools. Rules compute findings. Checks prove the demo math.',
    1120
  );
  f.eyebrow(64, 188, 'SHEET GROUPS');
  const groups = [
    ['CDP data', ['taxpayer · establishment', 'e_invoice · vat_return', 'VD · refund · filing'], false],
    ['Case store', ['fta_case · finding', 'letter · document', 'case_event log'], false],
    ['Taxpayer ledger', ['taxpayer_record only', 'Business Assistant sees it', 'Specialist never does'], true],
    ['Config + stand', ['ref_vat201_box', 'agent_option', 'session tables'], false],
  ];
  groups.forEach((g, i) => {
    block(f, 64 + i * 380, 220, 360, 176, g[0], g[1], g[2]);
  });

  f.eyebrow(64, 436, 'RULES R01–R13 (IN CODE, NOT IN THE LLM)');
  const rules = [
    ['R01–R04', 'Return / Emirate math'],
    ['R05–R08', 'VD · evidence · deadlines'],
    ['R09–R10', 'Risk · VD check'],
    ['R11–R13', 'People · access · tools'],
  ];
  rules.forEach((r, i) => {
    const x = 64 + i * 380;
    f.rect(`rule-${i}`, x, 468, 360, 88, { fill: T.paper2 });
    f.text(x + 20, 504, r[0], { size: 20, weight: 600 });
    f.text(x + 20, 536, r[1], { size: 15, color: T.muted });
  });

  f.eyebrow(64, 592, 'AGENTTOOLS (EXAMPLES)');
  const tools = [
    ['get_briefing', 'Signal'],
    ['get_return_reconciliation', 'Explain'],
    ['get_refund_breakdown', 'Explain'],
    ['match_ledger', 'Business'],
    ['prepare_vd / submit', 'Act'],
    ['check_answer', 'Follow-up'],
  ];
  tools.forEach((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 64 + col * 504;
    const y = 628 + row * 100;
    f.rect(`tool-${i}`, x, y, 480, 84, {
      fill: i === 1 || i === 2 ? T.accentTint : T.paper,
      stroke: i === 1 || i === 2 ? T.accent : T.rule,
    });
    f.text(x + 20, 664 + row * 100, t[0], { size: 18, weight: 600, mono: true });
    f.text(x + 20, 692 + row * 100, t[1], { size: 14, color: T.muted });
  });

  f.text(64, 860, 'Checks sheet', { size: 20, weight: 600 });
  f.text(
    64,
    896,
    'Expected totals (412,000 · 486,200 · 203,600 · …) are the acceptance targets for every demo run.',
    { size: 16, color: T.muted }
  );
  footer(f, 1080, 'Workbook purpose: two-case stand seed. Free-query examples outside these cases are not in the set.');
  f.save();
}

// ---------------------------------------------------------------------------
// 04 — Who does what (per step)
// ---------------------------------------------------------------------------
{
  const f = page(
    'meet-04-who-does-what',
    'CDP finds · AI explains · people decide',
    'Same split on every step of both cases.',
    920
  );
  const cols = [
    ['CDP / rules', ['Loads data', 'Runs R01–R13', 'Stores findings', 'Owns every figure'], false],
    ['AI agent', ['Ranks & briefs', 'Explains plainly', 'Recommends option', 'Drafts letter / VD'], true],
    ['Person', ['Chooses option', 'Edits if needed', 'Presses Send', 'Closes the case'], false],
  ];
  cols.forEach((c, i) => {
    const x = 64 + i * 504;
    block(f, x, 204, 480, 240, c[0], c[1], c[2]);
  });
  f.path('c1', [[544, 324], [568, 324]]);
  f.path('c2', [[1048, 324], [1072, 324]]);

  f.eyebrow(64, 484, 'EXAMPLE FLOW (SIMPLIFIED)');
  const flow = [
    ['Find', 'CDP'],
    ['Explain', 'AI + tools'],
    ['Decide', 'Person'],
    ['Act draft', 'AI'],
    ['Send', 'Person'],
    ['Check', 'Tools'],
  ];
  flow.forEach((s, i) => {
    const x = 64 + i * 248;
    f.rect(`flow-${i}`, x, 520, 228, 100, {
      fill: s[1] === 'AI + tools' || s[1] === 'AI' ? T.accentTint : T.paper,
      stroke: s[1].startsWith('AI') ? T.accent : T.rule,
    });
    f.text(x + 16, 560, s[0], { size: 19, weight: 600 });
    f.text(x + 16, 592, s[1], { size: 14, color: T.muted });
    if (i < 5) f.path(`f-${i}`, [[x + 228, 570], [x + 248, 570]]);
  });
  f.text(
    64,
    680,
    'Development rule from v2.9: the model writes text only. Each answer keeps a “How I got this” tool note.',
    { size: 17 }
  );
  footer(f, 880, 'Proposed stand behavior. Confirm CDP product interfaces separately from this demo seed.');
  f.save();
}

// ---------------------------------------------------------------------------
// 05 — Yasmeen worked numbers
// ---------------------------------------------------------------------------
{
  const f = page(
    'meet-05-yasmeen',
    'Case 1 · Al Yasmeen — AED 412,000 net',
    'Tool math first. Then the agent explains. Both Emirate boxes must move.',
    1000
  );
  f.eyebrow(64, 188, 'BOX COMPARISON (FROM TOOLS)');
  // Simple comparison bars as labeled blocks
  const bars = [
    ['Box 1b Dubai', 'Return 1,140,000', 'E-invoices 1,626,200', 'Gap +486,200'],
    ['Box 1a Abu Dhabi', 'Return 288,800', 'E-invoices 214,600', 'Gap −74,200'],
    ['Box 14 net', 'Return 823,100', 'Recomputed 1,235,100', 'Net +412,000'],
  ];
  bars.forEach((b, i) => {
    const y = 220 + i * 120;
    f.rect(`bar-${i}`, 64, y, 1472, 104, {
      fill: i === 2 ? T.accentTint : i % 2 ? T.paper2 : T.paper,
      stroke: i === 2 ? T.accent : T.rule,
    });
    f.text(88, y + 40, b[0], { size: 20, weight: 600 });
    f.text(420, y + 40, b[1], { size: 17 });
    f.text(820, y + 40, b[2], { size: 17 });
    f.text(1220, y + 40, b[3], { size: 18, weight: 600, color: i === 2 ? T.accent : T.ink });
  });

  f.eyebrow(64, 600, 'WHY (LEDGER EVIDENCE)');
  block(f, 64, 636, 704, 140, '34 cut-off invoices', [
    'October supplies booked in November',
    'VAT AED 412,000',
  ], false);
  block(f, 832, 636, 704, 140, '4 mis-allocated invoices', [
    'Dubai establishment reported in Box 1a',
    'VAT AED 74,200 → move to Box 1b',
  ], false);

  f.text(64, 820, 'AI help afterward', { size: 20, weight: 600 });
  f.text(
    64,
    856,
    'Call get_return_reconciliation + list_finding_invoices + match_ledger → explain → draft VD for both boxes → person submits → check_answer.',
    { size: 16, color: T.muted }
  );
  footer(f, 960, 'Amounts from Data Model Checks / Scenario Case 1. Do not “just add 412k to Dubai”.');
  f.save();
}

// ---------------------------------------------------------------------------
// 06 — Waha refund split
// ---------------------------------------------------------------------------
{
  const f = page(
    'meet-06-waha',
    'Case 2 · Al Waha — refund split',
    'Claim AED 284,600 breaks into supported, rejected and held parts.',
    980
  );
  f.eyebrow(64, 188, 'CLAIM BREAKDOWN');
  const parts = [
    ['Supported first', '53,600', 'Already backed by e-invoices', false],
    ['+ Paper invoices', '150,000', '6 tax invoices (not yet e-invoicing)', true],
    ['= Approved total', '203,600', 'Final approved refund', true],
    ['Rejected', '34,200', 'Card slips — not tax invoices · VD', false],
    ['On hold', '46,800', 'Bright Line not filing · verify', false],
  ];
  parts.forEach((p, i) => {
    const y = 220 + i * 88;
    f.rect(`p-${i}`, 64, y, 1472, 76, {
      fill: p[3] ? T.accentTint : T.paper,
      stroke: p[3] ? T.accent : T.rule,
    });
    f.text(88, y + 46, p[0], { size: 18, weight: 600 });
    f.text(520, y + 46, `AED ${p[1]}`, { size: 20, weight: 600, mono: true });
    f.text(820, y + 46, p[2], { size: 16, color: T.muted });
  });

  f.text(64, 700, 'Check', { size: 18, weight: 600 });
  f.text(
    64,
    736,
    '203,600 + 34,200 + 46,800 = 284,600. Non-filer case CDP-NF-2026-0733 stays linked.',
    { size: 17 }
  );
  f.text(64, 780, 'AI help afterward', { size: 18, weight: 600 });
  f.text(
    64,
    816,
    'get_refund_breakdown + get_supplier_status + prepare_reply / prepare_vd → person sends → check_answer → hold supplier issue.',
    { size: 16, color: T.muted }
  );
  footer(f, 940, 'Amounts from Scenario Case 2 / Data Model Checks. Synthetic demonstration only.');
  f.save();
}

// ---------------------------------------------------------------------------
// HTML meeting guide
// ---------------------------------------------------------------------------
const guideCss = `*{box-sizing:border-box}body{margin:0;background:#fff;color:${T.ink};font:18px/1.65 ${T.font}}main{max-width:1600px;margin:auto;padding:48px 32px}h1{font-size:40px;line-height:1.2;margin:8px 0 16px}h2{font-size:28px;margin-top:8px}p,li{max-width:1100px}.meta{font-size:14px;color:${T.muted};letter-spacing:.04em}nav{border-block:1px solid ${T.rule};padding:16px 0;margin:28px 0}.note{background:${T.accentTint};border-left:4px solid ${T.accent};padding:14px 20px;max-width:1200px}section{border-bottom:1px solid ${T.rule};padding:28px 0 40px}.figure{overflow:auto;border:1px solid ${T.rule};margin:20px 0}.figure svg{display:block;width:100%;min-width:1100px;height:auto}.talk{background:${T.paper2};padding:16px 20px;max-width:1200px}footer{margin-top:28px;font-size:14px;color:${T.muted}}a{color:${T.accent}}@media print{main{padding:0}.figure svg{min-width:0}nav{display:none}}`;

const sections = pages
  .map((p, i) => {
    const htmlPath = path.join(dir, p.slug + '.html');
    const raw = fs.readFileSync(htmlPath, 'utf8');
    const m = raw.match(/<svg[\s\S]*<\/svg>/);
    const svg = m ? m[0] : '';
    return `<section id="${p.slug}"><h2>${i + 1}. ${p.title}</h2><p>${p.sub}</p><div class="figure">${svg}</div><p class="files">Also: <code>${p.slug}.svg</code> · <code>${p.slug}.png</code></p></section>`;
  })
  .join('\n');

const talk = `
<aside class="talk"><strong>Meeting talk-track (about 1–2 minutes per chart)</strong>
<ol>
<li><strong>Two files:</strong> v2.9 is what the visitor plays; v1.2 is the database, rules and tools. Pair them.</li>
<li><strong>Journey:</strong> Specialist or Business → six steps → only Yasmeen and Waha on this stand (plus free-query policy).</li>
<li><strong>Data model:</strong> CDP tables + case store + Business-only ledger; R01–R13 in code; AgentTools are the AI’s allowed calls; Checks are the scoreboard.</li>
<li><strong>Who decides:</strong> CDP finds, AI explains/drafts from tools, person Send/Submit/Close.</li>
<li><strong>Yasmeen:</strong> show both Emirate gaps and net 412k; AI must not collapse this into “add 412k to Dubai.”</li>
<li><strong>Waha:</strong> walk 53.6 → +150 → 203.6 approved, 34.2 rejected, 46.8 held; supplier case stays open.</li>
</ol>
</aside>`;

const guide = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GITEX meeting charts — Scenario v2.9 + Data Model v1.2</title><style>${guideCss}</style></head><body><main>
<header>
<p class="meta">FTA / GITEX / MEETING CHARTS · PROPOSED · 25 NOVEMBER 2026</p>
<h1>Explain the two GITEX files with charts</h1>
<p>Plain-language diagrams for Scenario v2.9 EN and Data Model v1.2. Synthetic demonstration data. Not a live system.</p>
<p class="note"><strong>Skills used:</strong> diagram-design (primary SVG/HTML authoring) · project <code>diagram-tokens.json</code> · visualize skill composition rules (short labels, hierarchy, no prose walls inside figures) · reused FTA <code>build-editorial</code> Figure API. Not used: figma-generate-diagram, aws-architecture-diagram.</p>
</header>
${talk}
<nav><strong>Charts</strong><ol>
${pages.map((p) => `<li><a href="#${p.slug}">${p.title}</a></li>`).join('')}
</ol></nav>
${sections}
<footer>Sources: GITEX_CDP_AI_Agents_Stand_Scenario_v2.9_EN.docx · GITEX_CDP_Stand_Data_Model_v1.2.xlsx. Build: build-meeting-charts.cjs</footer>
</main></body></html>`;

fs.writeFileSync(path.join(dir, 'FTA-gitex-meeting-charts-guide.html'), guide);
fs.writeFileSync(
  path.join(dir, 'meeting-charts-manifest.json'),
  JSON.stringify(
    {
      created: '2026-11-25',
      skills: ['diagram-design', 'diagram-tokens.json', 'visualize (composition)', 'build-editorial.cjs'],
      pages: pages.map((p) => p.slug),
      guide: 'FTA-gitex-meeting-charts-guide.html',
    },
    null,
    2
  )
);

// Standalone SVG copies (extract from HTML)
for (const p of pages) {
  const html = fs.readFileSync(path.join(dir, p.slug + '.html'), 'utf8');
  const m = html.match(/<svg[\s\S]*<\/svg>/);
  if (m) fs.writeFileSync(path.join(dir, p.slug + '.svg'), m[0]);
}

console.log('built', pages.map((p) => p.slug).join(', '));
console.log('guide FTA-gitex-meeting-charts-guide.html');
