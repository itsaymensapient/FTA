# Connected FTA models and agents

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
