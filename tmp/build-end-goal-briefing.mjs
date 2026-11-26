/**
 * Build a plain-language briefing .docx for Aymen from scenario v2.9 + team plan.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  convertInchesToTwip,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'documents', 'GITEX-Stand-End-Goal-Process-and-Agentic-AI.docx')

const PAGE_W = 11906
const MARGIN = 720
const CONTENT_W = PAGE_W - MARGIN * 2

const border = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' }
const borders = { top: border, bottom: border, left: border, right: border }

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: 276 },
    ...opts.paragraph,
    children: [
      new TextRun({
        text,
        font: 'Calibri',
        size: opts.size ?? 22,
        bold: opts.bold,
        italics: opts.italics,
        color: opts.color ?? '1E293B',
      }),
    ],
  })
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, font: 'Calibri', size: 32, bold: true, color: '0B1F33' })],
  })
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [new TextRun({ text, font: 'Calibri', size: 26, bold: true, color: '163A5F' })],
  })
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: 'Calibri', size: 24, bold: true, color: '1E3A5F' })],
  })
}

function bullet(text, ref = 'bullets') {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text, font: 'Calibri', size: 22, color: '1E293B' })],
  })
}

function cell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.header ? { type: 'clear', fill: 'E8EEF5' } : undefined,
    children: [
      new Paragraph({
        spacing: { after: 40, before: 40 },
        children: [
          new TextRun({
            text,
            font: 'Calibri',
            size: opts.header ? 20 : 20,
            bold: !!opts.header || !!opts.bold,
            color: '1E293B',
          }),
        ],
      }),
    ],
  })
}

function table(headers, rows, widths) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((h, i) => cell(h, widths[i], { header: true })) }),
      ...rows.map((r) => new TableRow({ children: r.map((v, i) => cell(String(v), widths[i])) })),
    ],
  })
}

const doc = new Document({
  styles: {
    default: {
      document: {
        styles: [
          {
            id: 'Normal',
            run: { font: 'Calibri', size: 22 },
          },
        ],
      },
      heading1: {
        run: { font: 'Calibri', size: 32, bold: true, color: '0B1F33' },
        paragraph: { spacing: { before: 320, after: 160 }, keepNext: true },
      },
      heading2: {
        run: { font: 'Calibri', size: 26, bold: true, color: '163A5F' },
        paragraph: { spacing: { before: 260, after: 120 }, keepNext: true },
      },
      heading3: {
        run: { font: 'Calibri', size: 24, bold: true, color: '1E3A5F' },
        paragraph: { spacing: { before: 200, after: 80 }, keepNext: true },
      },
    },
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: 'steps',
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: 'agents',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: 16838 },
          margin: {
            top: MARGIN,
            bottom: MARGIN,
            left: MARGIN,
            right: MARGIN,
          },
        },
      },
      children: [
        p('GITEX CDP · AI Agents Stand', { size: 20, color: '64748B', after: 40 }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: 'End goal, process, and what the agentic AI must establish',
              font: 'Calibri',
              size: 40,
              bold: true,
              color: '0B1F33',
            }),
          ],
        }),
        p(
          'Plain-language briefing for Aymen (screens) and the local team. Based on scenario v2.9 and data model v1.2. Synthetic demo data only — not live EmaraTax.',
          { italics: true, color: '475569', after: 200 },
        ),
        p('Sources: GITEX_CDP_AI_Agents_Stand_Scenario_v2.9_EN · GITEX_CDP_Stand_Data_Model_v1.2 · team build plan (Ali / Sulieman / Ayman).', {
          size: 18,
          color: '64748B',
          after: 280,
        }),

        h1('1. What is the end goal?'),
        p(
          'Build a GITEX stand demo of the Federal Tax Authority Central Data Platform (CDP) with AI agents. A visitor experiences how AI helps an FTA specialist and a business VAT manager work the same two VAT cases — from finding to letter/reply to close — without the AI ever sending, submitting, or closing anything on its own.',
        ),
        p('In one sentence:'),
        p(
          'CDP finds the numbers and applies the tax rules; the agent explains, recommends, and drafts; people decide and press Send / Submit / Close.',
          { bold: true, after: 160 },
        ),
        p('Success looks like:'),
        bullet('A 3–4 minute guided run per role (FTA Specialist or Business).'),
        bullet('Two cases playable from both sides, with one shared set of facts and amounts.'),
        bullet('Every figure on screen traceable to CDP data or a coded rule — not invented by the language model.'),
        bullet('Optional free questions answered only via read-only data tools, with a “How I got this” note.'),
        bullet('Later: the same design can move to Cloudera hosting when licences arrive.'),

        h1('2. Who is in the system?'),
        p('Five lanes work together:'),
        table(
          ['Lane', 'Role'],
          [
            ['FTA specialist (person)', 'Chooses options, approves letters, closes or escalates'],
            ['Taxpayer / VAT manager (person)', 'Reviews, approves VD/reply, submits documents'],
            ['FTA agent (AI face)', 'Briefs, explains, drafts letters for the specialist'],
            ['FTA Assistant (AI face)', 'Reads the FTA letter, matches the ledger, drafts the taxpayer answer'],
            ['CDP (data + rules)', 'Owns numbers, legal thresholds, reconciliations, case store'],
          ],
          [3200, CONTENT_W - 3200],
        ),
        p(
          'Important: there is one agent capability with two faces. Both sides use the same CDP; each side only sees what its role is allowed to see.',
          { before: 160 },
        ),

        h1('3. Who does what (non‑negotiable split)'),
        table(
          ['Step', 'CDP (data & rules)', 'Agent (AI + tools)', 'Person'],
          [
            ['Find', 'Runs rules; produces findings with amounts', 'Ranks findings; writes briefing', '—'],
            ['Explain', 'Box tables, invoice lists, supplier status', 'Pulls evidence; explains in plain words; answers questions via tools', 'Asks'],
            ['Decide', 'Holds thresholds & deadlines (e.g. VD > AED 10,000; 20 business days)', 'Recommends one option; explains why others are weak', 'Chooses'],
            ['Act', 'Case numbers, deadlines, letter templates', 'Drafts letter / VD / reply from template + data', 'Sends or submits'],
            ['Follow-up', 'Checks VD vs e-invoices; supplier filing status', 'Reads reply & documents; recommends close / ask more / audit', 'Decides'],
            ['Close', 'Stores case + log', 'Writes case history + summary', 'Closes'],
          ],
          [1600, 3400, 3400, CONTENT_W - 8400],
        ),
        p('Development rules from the scenario:', { before: 160, bold: true }),
        bullet('Numbers from data. Every figure comes from a CDP query or coded rule. The model writes only the text.'),
        bullet('Tax rules in code. Thresholds and deadlines are business rules, not prompt improvisation.'),
        bullet('People decide. Nothing is sent, submitted, or closed without a person. Every step is logged.'),
        bullet('Access by role. Specialist vs taxpayer visibility is enforced.'),
        bullet('One case, one set of facts on both sides — same numbers, dates, amounts.'),
        bullet('Synthetic data only on the stand.'),

        h1('4. The visitor journey (what the application does)'),
        h2('4.1 Entry'),
        bullet('Visitor types a name.'),
        bullet('Chooses role: FTA Specialist or Business.'),
        bullet('Sees a short “agent at work” prep (what overnight rules checked / what the assistant already prepared).'),
        h2('4.2 FTA Specialist path'),
        bullet('Briefing: two high-risk events ordered by risk (Al Yasmeen return gap, then Al Waha refund).'),
        bullet('Open a case → Explain (evidence) → Decide (options) → Act (draft letter) → Send.'),
        bullet('Follow-up when the reply/VD arrives → Close or escalate.'),
        bullet('Optional free query on all demo data.'),
        bullet('Session summary; option to try as Business.'),
        h2('4.3 Business path'),
        bullet('Choose company (Al Yasmeen or Al Waha).'),
        bullet('Prep shows the FTA letter already handed agent-to-agent and a draft answer forming.'),
        bullet('Explain letter vs company ledger → Decide → Act (VD/reply/documents) → Submit.'),
        bullet('Follow-up FTA decision → Finish → summary; option to try as FTA Specialist.'),

        h1('5. The two cases (use cases 2 and 3)'),
        h2('5.1 Case 1 — Al Yasmeen · return vs e-invoices'),
        p(
          'Company: Al Yasmeen General Trading LLC. Period Aug–Oct 2026. Case CDP-VAT-2026-1187.',
        ),
        p('What CDP found:'),
        bullet('Box 1b (Dubai): declared AED 1,140,000 vs e-invoices AED 1,626,200 → gap AED 486,200 from 38 October invoices.'),
        bullet('Box 1a (Abu Dhabi): overstated by AED 74,200.'),
        bullet('Box 14 net gap: AED 412,000 (823,100 declared vs 1,235,100 from e-invoices).'),
        p('What the story concludes:'),
        bullet('34 invoices booked late in November (cut-off); 4 Dubai-branch invoices reported under Abu Dhabi.'),
        bullet('One Voluntary Disclosure corrects both; case closes with +AED 412,000 VAT and AED 74,200 moved to Dubai.'),
        p('Recommended FTA option: ask taxpayer to explain/correct within 20 business days (not jump to audit).'),
        p('Recommended Business option: submit VD + reply (not “explanation only” — above AED 10,000 needs a VD).'),

        h2('5.2 Case 2 — Al Waha · VAT refund not fully supported'),
        p(
          'Company: Al Waha Electronics Trading LLC. Refund claim AED 284,600. Case CDP-REF-2026-0219. Linked non-filer case on Bright Line: CDP-NF-2026-0733.',
        ),
        p('What CDP found:'),
        bullet('Box 9 return AED 1,212,000 vs received e-invoices AED 1,027,800.'),
        bullet('Fully supported by e-invoices: AED 53,600.'),
        bullet('Without e-invoice support: AED 184,200 (later split into paper invoices vs card slips).'),
        bullet('Bright Line (supplier not filing): AED 46,800 on 14 invoices — hold, do not reject yet.'),
        p('What the story concludes:'),
        bullet('Approve AED 53,600 first; request documents for the rest.'),
        bullet('After reply: approve paper invoices AED 150,000; reject card slips AED 34,200 (not tax invoices); hold Bright Line AED 46,800.'),
        bullet('Final approved refund AED 203,600; non-filer case remains open on Bright Line.'),

        h1('6. The six steps the agent must run (both sides)'),
        table(
          ['Step', 'FTA specialist + FTA agent', 'Business + FTA Assistant'],
          [
            ['1 Signal / Check', 'Briefing ordered by risk', 'Company overview: open issue + deadlines'],
            ['2 Explain', 'Findings + evidence; open invoices as forms', 'FTA letter explained from company records / ledger'],
            ['3 Decide', '2–3 options; recommended first', 'Same; weak options explained'],
            ['4 Act', 'Draft letter; specialist Sends', 'Draft VD/reply/docs; taxpayer Submits'],
            ['5 Follow-up', 'Answer checked against data', 'FTA decision explained'],
            ['6 Closed / Done', 'Case history; next event', 'Result + FTA side of the case'],
          ],
          [2000, Math.floor((CONTENT_W - 2000) / 2), Math.ceil((CONTENT_W - 2000) / 2)],
        ),
        p(
          'Between human decisions the agent works on its own: overnight screening, waiting for replies, checking VDs, preparing the other side’s pack agent-to-agent (FTA letter lands in the Assistant already matched to the ledger).',
          { before: 160 },
        ),

        h1('7. What the agentic AI must establish'),
        p(
          'This is the contract for Sulieman’s agents (and Ali’s free-question path). The language model is not allowed to invent VAT maths.',
        ),

        h2('7.1 Capabilities the agents must provide'),
        bullet('Overnight / prep work: turn CDP rule findings into a ranked briefing or a prepared taxpayer pack before the visitor opens the screen.'),
        bullet('Explanation: pull the right evidence (box table, invoice list, supplier status, ledger lines) and narrate it clearly.'),
        bullet('Recommendation: pick a recommended option using coded rules (VD threshold, deadlines, support status); mark weak options with a fixed reply.'),
        bullet('Drafting: fill letter / VD / reply templates from case data — never free-invent amounts.'),
        bullet('Handoff agent-to-agent: FTA Act produces a letter the Business Assistant already has.'),
        bullet('Follow-up judgement support: compare reply/VD/documents to e-invoices and recommend close, ask more, or audit — person still decides.'),
        bullet('Free questions (Ali): map natural language to read-only query tools; return tables/lists with “How I got this”; refuse out-of-scope / real-company / other-taxpayer data.'),

        h2('7.2 What must be tools / code (not the LLM)'),
        bullet('Return vs e-invoices by VAT201 box (1a–1g, 9, 14).'),
        bullet('VD checked against e-invoices.'),
        bullet('Refund vs received e-invoices (Box 9) and support split.'),
        bullet('Supplier filing / non-filer status.'),
        bullet('Invoice lists and invoice forms from the e-invoice registry.'),
        bullet('Case store: case IDs, deadlines, letters, events.'),
        bullet('Thresholds: e.g. Voluntary Disclosure above AED 10,000; refund decision timelines; Emirate of establishment for Boxes 1a–1g; tax invoice required for recoverable input VAT.'),

        h2('7.3 What the LLM is for'),
        bullet('Understanding the visitor’s question and choosing which tool / step to run.'),
        bullet('Writing plain-language explanations, briefings, letter prose, and weak-option warnings grounded in tool results.'),
        bullet('Sequencing the six steps and remembering where the visitor is in the journey.'),
        bullet('Never: inventing gaps, inventing invoice totals, or approving Send/Submit/Close.'),

        h2('7.4 Planned agent surfaces (team split)'),
        table(
          ['Component', 'Owner', 'Job'],
          [
            ['db + seed + 38 checks + query tools + ask agent', 'Ali', 'Trusted data, verification, free questions'],
            ['rules.py + tools/ + prompts + fta_agent + fta_assistant + llm.py', 'Sulieman', 'Tax rules, LangGraph six-step agents, model switch point'],
            ['Stand screens + app wiring', 'Ayman', 'Visitor UX; connect screens to agents when ready'],
          ],
          [4200, 1800, CONTENT_W - 6000],
        ),

        h1('8. Free query (what “ask” must do)'),
        p('Two places to ask (text or later voice):'),
        bullet('On a case screen: “Ask about this case…” (e.g. why Box 1b, why card slips fail).'),
        bullet('From briefing / assistant: questions on demo data (FTA) or own company only (Business).'),
        p('Answers are a table, list, or chart plus “How I got this” and a possible next step (e.g. open a case). Out-of-scope asks get a polite refusal and example questions.'),

        h1('9. Where we are now vs the end goal'),
        table(
          ['Layer', 'Status (local laptop)'],
          [
            ['Screens (FTA + Business, both cases)', 'Built — stand UI running'],
            ['B1 data model + local Postgres seed', 'Working — Live DB'],
            ['API feeding stand numbers from DB', 'Working'],
            ['B1 Checks (37 story numbers)', 'Passing'],
            ['Free-question Python path (Ali)', 'CLI/tools ready; not fully wired into Ask bar yet'],
            ['LangGraph FTA agent + Assistant + tax tools (Sulieman)', 'Not started — next major gap for “agentic” behaviour'],
            ['People-gated Send/Submit/Close with full agent drafts', 'UI wired with demo narrative; real agent drafts still to come'],
            ['Azure / Cloudera production hosting', 'Deferred — local first'],
          ],
          [4800, CONTENT_W - 4800],
        ),

        h1('10. Practical definition of “done” for the stand'),
        new Paragraph({
          numbering: { reference: 'steps', level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: 'Visitor can complete both roles on both cases in ~3–4 minutes each.', font: 'Calibri', size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: 'steps', level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: 'All on-screen amounts match B1 checks / seeded CDP tables.', font: 'Calibri', size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: 'steps', level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: 'Agent recommendations and drafts come from tools + templates; LLM only phrases them.', font: 'Calibri', size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: 'steps', level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: 'No Send / Submit / Close without an explicit person action; actions logged.', font: 'Calibri', size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: 'steps', level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: 'Free questions answered only through read-only tools with provenance.', font: 'Calibri', size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: 'steps', level: 0 },
          spacing: { after: 200 },
          children: [new TextRun({ text: 'Same story readable from FTA and Business sides with identical facts.', font: 'Calibri', size: 22 })],
        }),

        h1('11. One-picture process (remember this)'),
        p('Overnight: CDP rules find issues → Agent ranks and prepares.'),
        p('Morning: Person opens briefing / company → Agent explains with evidence.'),
        p('Decide: Agent recommends → Person chooses.'),
        p('Act: Agent drafts → Person Sends / Submits.'),
        p('Later: Other side’s agent already has the pack → Person responds.'),
        p('Follow-up: Agent checks against data → Person closes or escalates.'),
        p(
          'That loop — not “AI replaces the tax officer” — is the product story the stand must prove.',
          { bold: true, before: 120 },
        ),

        p('— End of briefing —', { color: '64748B', before: 280, italics: true }),
      ],
    },
  ],
})

const buf = await Packer.toBuffer(doc)
fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, buf)
console.log('wrote', OUT, `(${(buf.length / 1024).toFixed(1)} KB)`)
