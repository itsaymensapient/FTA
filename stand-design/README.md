# FTA Stand Design Export

UI-only React app extracted from the GITEX FTA CDP stand. Screens are connected for walkthrough navigation. **No API, database, Temporal, or journey logic.**

## Run

```bash
cd stand-design
npm install
npm run dev
```

Opens on http://localhost:5180

## What's included

- FTA dark navy + Business light/gold shells
- Entry → role → prep → briefing → explain → act → closed
- Business chooser → overview → explain → act → follow-up
- Static fixtures (Al Yasmeen / Al Waha numbers)
- Screen-to-screen navigation only (`go('screen_id')`)

## Intentionally excluded

- `/api/agent/*`, Postgres, Temporal
- Live DecisionOptions / UC2 / refund journey state machines
- AskBar LLM calls

Push this folder to another project as a design reference or prototype shell.
