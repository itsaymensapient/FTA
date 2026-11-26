# Stand process & design alignment (scenario v2.9 + screenshots)

## Process (must match flowchart + Screens sheet)

People decide; agents prepare; numbers come from CDP tools/rules.

| Flow step | FTA side | Business side | Demo implementation |
|-----------|----------|---------------|---------------------|
| Signal | Briefing (`03_briefing`) | Prep / letter arrived (`prep_biz`) | Live `/api/stand` + prep lists |
| Explain | Return recon + invoices; refund + supplier | Letter + ledger / paper docs | Tools via case-tool + journeys |
| Decide | Options from `agent_option` | Options from `agent_option` | `DecisionOptions` + `select_option` |
| Act | Approve whole journey → Send letter | Submit VD/reply or extension | `uc2` / `refund` journeys |
| Follow-up | Verify / grant-deny extension | Wait / switch role | Shared journey state in Postgres |
| Closed / Done | Closed screen → Event 2 or summary | Finish → summary | Persisted `app.uc2_journey` |

Branches (workbook options): recommended, audit, hold-all (refund), weak blocked, extension grant/deny. Changing draft or FTA option clears approval.

## Design (must match mock screens)

| Surface | Scenario look | Stand |
|---------|---------------|-------|
| FTA shell | Dark navy, blue primary | `.shell-fta.dark` |
| Business shell | Light UI, gold accents, navy company bar | `.shell-biz` |
| Role pick | Two cards, FTA vs Business copy | `RoleScreen` |
| Explain | AI agent bubbles + reconciliation table | `C1ExplainFta` |
| Decide/Act | Options left, white letter preview right, Send/Edit | `UC2Journey` / `RefundJourney` FTA layout |
| Stepper | Signal→Closed / Check→Done | `Stepper` (Decide vs Act follows journey state) |
| Activity footer | AGENT / ASSISTANT ACTIVITY | `ActivityFooter` |

## Aligned this pass

- Entry / role / prep / briefing copy and layout matched to scenario screens 05–08 and prep mock.
- FTA Explain recon table + agent bubbles + activity footer matched to screen 12.
- FTA Act letter preview (white doc, case/attachment cards, Send/Edit/Cancel) matched to screen 14.
- Closed case history + next-event handoff matched to screen 16.
- Business company chooser, Y1/W1 overview, Y2 explain chrome matched to screens 09–10.

## Aligned (business follow-on)

- Y2 Explain matched to scenario screen 17 (FTA letter + return table + ledger groups).
- Y2b / CaseInvoices business labels; Y4 / W4 follow-up letter + status cards.
- Core scenario UI chrome for FTA + business paths is in place for the demo.

## Outside UI (goal still open)

- Temporal / free-query / browser E2E of every DecisionOptions branch — not UI chrome.
