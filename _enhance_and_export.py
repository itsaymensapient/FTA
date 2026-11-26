"""Enhance stand CSS and scaffold independent stand-design export app."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent
STAND_CSS = ROOT / "stand" / "src" / "index.css"
EXPORT = ROOT / "stand-design"


def enhance_stand_css() -> None:
    css = STAND_CSS.read_text(encoding="utf-8")
    marker = "/* design-enhance */"
    enhance = """
/* design-enhance */
.shell-fta {
  background:
    radial-gradient(1200px 520px at 12% -10%, rgba(59, 122, 240, 0.22), transparent 55%),
    radial-gradient(900px 480px at 90% 0%, rgba(216, 196, 138, 0.1), transparent 50%),
    linear-gradient(180deg, #0a1a2c 0%, #0b1f33 42%, #0e2438 100%);
}
.shell-biz {
  background:
    radial-gradient(1000px 480px at 8% -8%, rgba(184, 137, 58, 0.12), transparent 50%),
    radial-gradient(800px 420px at 100% 0%, rgba(22, 58, 95, 0.08), transparent 45%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f6 55%, #e8eef4 100%);
}
.shell-fta [data-slot="card"] {
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 10px 28px rgba(3, 12, 24, 0.28);
}
.shell-biz [data-slot="card"] {
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 8px 24px rgba(18, 38, 58, 0.06);
}
.letter-sheet {
  background: linear-gradient(180deg, #ffffff 0%, #f7f9fb 100%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 18px 40px rgba(18, 38, 58, 0.12);
}
.agent-bubble {
  animation: rise-in 360ms var(--ease-out) both;
}
@keyframes rise-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .agent-bubble { animation: none; }
}
"""
    if marker not in css:
        STAND_CSS.write_text(css.rstrip() + "\n" + enhance, encoding="utf-8")
        print("enhanced stand css")
    else:
        print("stand css already enhanced")


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.lstrip("\n"), encoding="utf-8")
    print("wrote", path.relative_to(ROOT))


def scaffold_export() -> None:
    # Copy enhanced CSS baseline from stand, strip ai-activity if desired — keep tokens
    css = STAND_CSS.read_text(encoding="utf-8")
    write(EXPORT / "package.json", """
{
  "name": "stand-design",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host localhost --port 5180",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 5180"
  },
  "dependencies": {
    "@fontsource-variable/outfit": "^5.3.0",
    "clsx": "^2.1.1",
    "lucide-react": "^1.80.0",
    "motion": "^14.14.0",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "tailwind-merge": "^3.7.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.5",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "tailwindcss": "^4.3.5",
    "typescript": "~5.9.0",
    "vite": "^8.3.6"
  }
}
""")
    write(EXPORT / "tsconfig.json", """
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
""")
    write(EXPORT / "tsconfig.app.json", """
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
""")
    write(EXPORT / "tsconfig.node.json", """
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
""")
    # Fix tsconfig for vite build - use references style like stand or simpler
    write(EXPORT / "tsconfig.json", """
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
""")
    write(EXPORT / "vite.config.ts", """
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { host: 'localhost', port: 5180 },
})
""")
    write(EXPORT / "index.html", """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FTA Stand Design Export</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
""")
    write(EXPORT / "README.md", """
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
""")

    # CSS for export: take stand css but remove shadcn imports that need packages
    # Rebuild a self-contained CSS with same tokens
    write(EXPORT / "src" / "index.css", """
@import "tailwindcss";
@import "@fontsource-variable/outfit/index.css";

@theme inline {
  --font-sans: "Outfit Variable", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Outfit Variable", ui-sans-serif, system-ui, sans-serif;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-success: var(--success);
  --color-gold: var(--gold);
  --radius-lg: var(--radius);
}

:root, .shell-biz {
  --radius: 0.75rem;
  --background: #eef2f6;
  --foreground: #12263a;
  --card: #ffffff;
  --card-foreground: #12263a;
  --primary: #163a5f;
  --primary-foreground: #f7fafc;
  --secondary: #e8eef4;
  --secondary-foreground: #163a5f;
  --muted: #e8eef4;
  --muted-foreground: #5b6b7c;
  --accent: #f3ece0;
  --accent-foreground: #7a5a1e;
  --destructive: #c2473f;
  --border: #d5dee8;
  --input: #d5dee8;
  --ring: #163a5f;
  --success: #1f8a5b;
  --gold: #b8893a;
  --shell-chrome: #ffffff;
  --shell-footer: #e7edf3;
}

.shell-fta, .dark {
  --radius: 0.75rem;
  --background: #0b1f33;
  --foreground: #e8eef5;
  --card: #152a40;
  --card-foreground: #e8eef5;
  --primary: #3b7af0;
  --primary-foreground: #f5f8ff;
  --secondary: #1a3048;
  --secondary-foreground: #d7e3f0;
  --muted: #1a3048;
  --muted-foreground: #9bb0c4;
  --accent: #2a3f28;
  --accent-foreground: #d8c48a;
  --destructive: #e06a62;
  --border: #2c425c;
  --input: #2c425c;
  --ring: #3b7af0;
  --success: #3ecf8e;
  --gold: #d8c48a;
  --shell-chrome: #0d2236;
  --shell-footer: #0a1c2e;
}

.shell-fta {
  background:
    radial-gradient(1200px 520px at 12% -10%, rgba(59, 122, 240, 0.22), transparent 55%),
    radial-gradient(900px 480px at 90% 0%, rgba(216, 196, 138, 0.1), transparent 50%),
    linear-gradient(180deg, #0a1a2c 0%, #0b1f33 42%, #0e2438 100%);
  color: var(--foreground);
  min-height: 100vh;
}
.shell-biz {
  background:
    radial-gradient(1000px 480px at 8% -8%, rgba(184, 137, 58, 0.12), transparent 50%),
    radial-gradient(800px 420px at 100% 0%, rgba(22, 58, 95, 0.08), transparent 45%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f6 55%, #e8eef4 100%);
  color: var(--foreground);
  min-height: 100vh;
}

.stand-page { @apply mx-auto w-full max-w-6xl; }
.stand-title { @apply text-balance text-[1.375rem] font-semibold tracking-[-0.02em] sm:text-[1.5rem]; line-height: 1.25; }
.stand-subtitle { @apply text-[0.8125rem] text-muted-foreground; line-height: 1.5; }
.stand-label { @apply text-[0.625rem] font-semibold tracking-[0.1em] text-gold uppercase; }
.num-gap { @apply font-semibold text-destructive; }
.num-ok { @apply font-semibold text-success; }
.num-gold { @apply font-bold text-gold; }
.letter-sheet {
  background: linear-gradient(180deg, #ffffff 0%, #f7f9fb 100%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 18px 40px rgba(18, 38, 58, 0.12);
}
.panel {
  @apply rounded-xl border border-border bg-card p-5 sm:p-6;
}
.shell-fta .panel { box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 28px rgba(3,12,24,0.28); }
.shell-biz .panel { box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 24px rgba(18,38,58,0.06); }
.agent-bubble { animation: rise-in 360ms var(--ease-out) both; }
@keyframes rise-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .agent-bubble { animation: none; }
}
button { cursor: pointer; }
body { margin: 0; font-family: var(--font-sans); }
""")

    write(EXPORT / "src" / "lib" / "cn.ts", """
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
""")

    write(EXPORT / "src" / "fixtures.ts", """
export const DEMO = {
  visitorDefault: 'Sara',
  ftaToday: 'Thu 10 Dec 2026',
  bizToday: 'Fri 11 Dec 2026',
  followUpToday: 'Mon 14 Dec 2026',
}

export const COMPANIES = {
  yasmeen: {
    name: 'Al Yasmeen General Trading LLC',
    trn: '100482157390003',
    caseId: 'CDP-VAT-2026-1187',
  },
  waha: {
    name: 'Al Waha Electronics Trading LLC',
    trn: '100293746150003',
    caseId: 'CDP-REF-2026-0219',
  },
}

export const YASMEEN_BOXES = [
  { box: '1a', label: 'Abu Dhabi', declared: 288800, einvoices: 214600, gap: -74200 },
  { box: '1b', label: 'Dubai', declared: 1140000, einvoices: 1626200, gap: 486200 },
  { box: '1c', label: 'Sharjah', declared: 96300, einvoices: 96300, gap: 0 },
  { box: '9', label: 'Input tax', declared: 702000, einvoices: 702000, gap: 0 },
  { box: '14', label: 'Payable tax', declared: 823100, einvoices: 1235100, gap: 412000 },
]

export const BRIEFING = [
  {
    id: 'yasmeen',
    reason: 'AED 412,000 under-declared',
    event: 'VAT return does not match e-invoices',
    company: COMPANIES.yasmeen.name,
    detail: 'Output VAT under-declared by AED 412,000 net · Aug–Oct 2026 · Dubai gap AED 486,200.',
  },
  {
    id: 'waha',
    reason: 'Refund decision due 25 Dec',
    event: 'VAT refund request not fully supported',
    company: COMPANIES.waha.name,
    detail: 'Refund claimed AED 284,600 · AED 231,000 not supported by e-invoices or by a filing supplier.',
  },
]

export const aed = (n: number) =>
  `AED ${n.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`
export const aedPlain = (n: number) =>
  n.toLocaleString('en-AE', { maximumFractionDigits: 0 })
""")

    write(EXPORT / "src" / "nav.tsx", """
import { createContext, useContext, useState, type ReactNode } from 'react'

export type ScreenId =
  | '01_name'
  | '02_role'
  | 'prep_fta'
  | '03_briefing'
  | '04_c1_explain'
  | '05_c1_documents'
  | '06_c1_act'
  | '07_c1_followup'
  | '07b_c1_closed'
  | 'B01_company'
  | 'Y1_home'
  | 'Y2_explain'
  | 'Y3_act'
  | 'Y4_followup'

type Nav = {
  screen: ScreenId
  visitorName: string
  setName: (v: string) => void
  go: (id: ScreenId) => void
}

const Ctx = createContext<Nav | null>(null)

export function NavProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>('01_name')
  const [visitorName, setName] = useState('Sara')
  return (
    <Ctx.Provider value={{ screen, visitorName, setName, go: setScreen }}>
      {children}
    </Ctx.Provider>
  )
}

export function useNav() {
  const v = useContext(Ctx)
  if (!v) throw new Error('NavProvider missing')
  return v
}
""")

    write(EXPORT / "src" / "components" / "ui.tsx", """
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('panel agent-bubble', className)}>{children}</div>
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="stand-label mb-2">{children}</div>
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'gold' | 'ghost'
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:opacity-95',
        variant === 'outline' && 'border border-border bg-transparent hover:bg-muted/40',
        variant === 'gold' && 'bg-gold text-white hover:opacity-95',
        variant === 'ghost' && 'bg-transparent hover:bg-muted/40',
        className,
      )}
      {...props}
    />
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="h-11 w-full rounded-lg border border-border bg-card/70 px-3 text-center text-[0.9375rem] outline-none focus:border-primary"
      {...props}
    />
  )
}
""")

    write(EXPORT / "src" / "components" / "Shell.tsx", """
import type { ReactNode } from 'react'
import { CalendarDays, CircleUserRound } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Shell({
  variant,
  title,
  visitorName,
  companyLabel,
  date,
  footer,
  children,
}: {
  variant: 'fta' | 'biz' | 'entry'
  title?: string
  visitorName: string
  companyLabel?: string
  date?: string
  footer?: ReactNode
  children: ReactNode
}) {
  const isBiz = variant === 'biz'
  return (
    <div className={cn(isBiz ? 'shell-biz' : 'shell-fta dark', 'flex min-h-screen flex-col')}>
      <header
        className="sticky top-0 z-20 border-b border-border/80 backdrop-blur-md"
        style={{ background: 'color-mix(in oklab, var(--shell-chrome) 92%, transparent)' }}
      >
        <div className="stand-page flex items-center justify-between gap-4 px-6 py-3">
          <div>
            <div className={cn('text-[0.875rem] font-semibold', isBiz ? 'text-gold' : 'text-foreground')}>
              {title || (isBiz ? 'CDP · FTA ASSISTANT' : 'FTA CDP · AI Agent Demo')}
            </div>
            {isBiz ? (
              <div className="mt-0.5 text-[0.6875rem] text-muted-foreground">for business · GITEX concept</div>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full border border-border px-2.5 py-1 text-xs">Demo data</span>
            {date ? (
              <span className="hidden items-center gap-1.5 text-muted-foreground sm:flex">
                <CalendarDays className="size-3.5 opacity-70" />
                {date}
              </span>
            ) : null}
            <span className="flex items-center gap-1.5 font-medium">
              <CircleUserRound className="size-3.5 opacity-70" />
              {visitorName}
              {isBiz ? ' · Business' : ''}
            </span>
          </div>
        </div>
        {isBiz && companyLabel ? (
          <div className="bg-primary text-primary-foreground">
            <div className="stand-page flex justify-between gap-2 px-6 py-2.5 text-sm">
              <span className="font-medium">{visitorName} · Business</span>
              <span className="truncate opacity-90">{companyLabel}</span>
              <span className="opacity-80">{date}</span>
            </div>
          </div>
        ) : null}
      </header>
      <main className="stand-page flex-1 px-5 py-7 sm:px-6 sm:py-8">{children}</main>
      {footer ? (
        <footer className="sticky bottom-0 border-t border-border/80" style={{ background: 'var(--shell-footer)' }}>
          <div className="stand-page px-6 py-3 text-xs text-muted-foreground">{footer}</div>
        </footer>
      ) : null}
    </div>
  )
}

export function ActivityFooter({
  label,
  items,
}: {
  label: string
  items: { label: string; status: 'done' | 'wait' }[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="font-semibold tracking-[0.08em] text-primary uppercase">{label}</span>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span>{item.status === 'done' ? '✓' : '⏳'}</span>
          {item.label}
        </span>
      ))}
    </div>
  )
}

export function Stepper({
  variant,
  current,
  eventLabel,
}: {
  variant: 'FTA' | 'BUSINESS'
  current: string
  eventLabel?: string
}) {
  const steps =
    variant === 'FTA'
      ? ['Signal', 'Explain', 'Decide', 'Act', 'Follow-up', 'Closed']
      : ['Check', 'Explain', 'Decide', 'Act', 'Follow-up', 'Done']
  const map: Record<string, number> = {
    SIGNAL: 0, CHECK: 0, EXPLAIN: 1, DECIDE: 2, ACT: 3, FOLLOW_UP: 4, CLOSED: 5, DONE: 5,
  }
  const idx = map[current] ?? 0
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((label, i) => {
          const done = i < idx
          const active = i === idx
          return (
            <li key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-[0.6875rem] font-semibold',
                  done && 'bg-success text-white',
                  active && 'bg-primary text-primary-foreground',
                  !done && !active && 'bg-muted text-muted-foreground',
                )}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={cn('text-sm', active ? 'font-semibold' : 'text-muted-foreground')}>{label}</span>
            </li>
          )
        })}
      </ol>
      {eventLabel ? <div className="text-sm text-muted-foreground">{eventLabel}</div> : null}
    </div>
  )
}
""")

    # Screens file - main connected walkthrough
    write(EXPORT / "src" / "screens.tsx", """
import { Building2, Landmark } from 'lucide-react'
import { ActivityFooter, Shell, Stepper } from '@/components/Shell'
import { Button, Input, Panel, SectionLabel } from '@/components/ui'
import {
  BRIEFING,
  COMPANIES,
  DEMO,
  YASMEEN_BOXES,
  aed,
  aedPlain,
} from '@/fixtures'
import { useNav, type ScreenId } from '@/nav'

export function CurrentScreen() {
  const { screen } = useNav()
  const map: Record<ScreenId, () => JSX.Element> = {
    '01_name': NameScreen,
    '02_role': RoleScreen,
    prep_fta: PrepFta,
    '03_briefing': Briefing,
    '04_c1_explain': ExplainFta,
    '05_c1_documents': DocumentsFta,
    '06_c1_act': ActFta,
    '07_c1_followup': FollowupFta,
    '07b_c1_closed': ClosedFta,
    B01_company: CompanyChooser,
    Y1_home: Y1Home,
    Y2_explain: Y2Explain,
    Y3_act: Y3Act,
    Y4_followup: Y4Followup,
  }
  const Screen = map[screen]
  return <Screen />
}

function NameScreen() {
  const { visitorName, setName, go } = useNav()
  return (
    <Shell
      variant="entry"
      visitorName={visitorName || 'Visitor'}
      date={DEMO.ftaToday}
      footer={<ActivityFooter label="AGENT ACTIVITY" items={[{ label: 'Waiting for a visitor', status: 'wait' }]} />}
    >
      <div className="mx-auto flex min-h-[68vh] max-w-lg flex-col justify-center gap-7 text-center">
        <div>
          <h1 className="stand-title">Welcome to the FTA Central Data Platform</h1>
          <p className="stand-subtitle mx-auto mt-3 max-w-[42ch]">
            Meet the AI agent that works with tax data. All data on this stand is synthetic.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <label className="stand-label">What is your name?</label>
          <Input value={visitorName} onChange={(e) => setName(e.target.value)} />
          <Button className="mx-auto min-w-40" disabled={!visitorName.trim()} onClick={() => go('02_role')}>
            Continue
          </Button>
        </div>
      </div>
    </Shell>
  )
}

function RoleScreen() {
  const { visitorName, go } = useNav()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      variant="entry"
      visitorName={name}
      footer={<ActivityFooter label="AGENT ACTIVITY" items={[{ label: `Visitor: ${name}`, status: 'done' }]} />}
    >
      <h1 className="stand-title mb-8 text-center">Hello, {name}. Who are you today?</h1>
      <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
        <button
          className="panel border-2 border-primary text-left"
          onClick={() => go('prep_fta')}
        >
          <Landmark className="mb-3 size-5 text-primary" />
          <div className="font-semibold">FTA Specialist</div>
          <p className="mt-2 text-sm text-muted-foreground">
            The agent finds tax risks and explains them. You decide; the agent acts and follows up.
          </p>
        </button>
        <button className="panel border border-border text-left hover:border-gold/60" onClick={() => go('B01_company')}>
          <Building2 className="mb-3 size-5 text-gold" />
          <div className="font-semibold">Business</div>
          <p className="mt-2 text-sm text-muted-foreground">
            The agent checks your VAT return against your e-invoices and helps you respond to the FTA.
          </p>
        </button>
      </div>
    </Shell>
  )
}

function PrepFta() {
  const { visitorName, go } = useNav()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      variant="fta"
      visitorName={name}
      date={DEMO.ftaToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'CDP rules overnight', status: 'done' },
            { label: 'Evidence collected', status: 'done' },
            { label: 'Writing briefing', status: 'wait' },
          ]}
        />
      }
    >
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[220px_1fr] md:items-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-28 items-center justify-center rounded-full border border-gold/50 text-4xl text-gold">
            ✦
          </div>
          <div className="font-semibold text-gold">FTA agent</div>
          <p className="mt-2 text-sm text-muted-foreground">working for you since 06:00</p>
        </div>
        <Panel>
          <h2 className="mb-4 text-xl font-semibold">Good day, {name}. I prepared your day.</h2>
          <ul className="space-y-2 text-sm">
            <li>✓ 21,480 new e-invoices loaded and checked</li>
            <li>✓ 214 VAT returns reconciled, box by box</li>
            <li>✓ 12 refund requests and 1,206 suppliers checked</li>
            <li>⏳ Writing your briefing and the draft letters…</li>
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg bg-muted/60 p-3"><div className="stand-label">Found</div><div className="mt-1 text-lg font-semibold">2 issues</div></div>
            <div className="rounded-lg bg-muted/60 p-3"><div className="stand-label">At stake</div><div className="mt-1 text-lg font-semibold text-gold">AED 643,000</div></div>
            <div className="rounded-lg bg-muted/60 p-3"><div className="stand-label">Waiting</div><div className="mt-1 text-lg font-semibold">2 decisions</div></div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => go('03_briefing')}>Open my briefing</Button>
            <Button variant="outline" onClick={() => go('03_briefing')}>Skip</Button>
          </div>
        </Panel>
      </div>
    </Shell>
  )
}

function Briefing() {
  const { visitorName, go } = useNav()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      variant="fta"
      visitorName={name}
      date={DEMO.ftaToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: '21,480 e-invoices checked', status: 'done' },
            { label: '2 items prioritised by risk', status: 'done' },
          ]}
        />
      }
    >
      <div className="grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <Panel>
          <SectionLabel>AI agent</SectionLabel>
          <p className="text-[0.9375rem] leading-7">
            Good day, {name}. Two items need your attention, ordered by risk. Where would you like to start?
          </p>
        </Panel>
        <div className="space-y-4">
          <div className="stand-label">2 items · ordered by risk</div>
          {BRIEFING.map((item) => (
            <Panel key={item.id} className="border-l-2 border-l-destructive">
              <div className="flex justify-between gap-4">
                <div>
                  <div className="text-[0.8125rem] font-semibold uppercase text-destructive">High · {item.reason}</div>
                  <div className="mt-1 font-semibold">{item.event}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.company}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <Button
                  onClick={() => go(item.id === 'yasmeen' ? '04_c1_explain' : '04_c1_explain')}
                >
                  Open
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </Shell>
  )
}

function ExplainFta() {
  const { visitorName, go } = useNav()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      variant="fta"
      visitorName={visitorName || DEMO.visitorDefault}
      date={DEMO.ftaToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'VAT return matched to 1,912 documents', status: 'done' },
            { label: 'Gap traced to 38 invoices', status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="EXPLAIN" eventLabel={`Event 1 · ${company.name}`} />
      <div className="grid items-start gap-5 lg:grid-cols-[340px_1fr]">
        <div className="space-y-3">
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm leading-6">
              {company.name} filed its VAT return for Aug–Oct 2026. Dubai Box 1b gap {aed(486200)}. Net under-declaration{' '}
              <span className="num-gold">{aed(412000)}</span> — high risk.
            </p>
          </Panel>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go('05_c1_documents')}>Show 38 invoices</Button>
            <Button onClick={() => go('06_c1_act')}>What can I do?</Button>
          </div>
        </div>
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">Tax return reconciliation · Aug–Oct 2026</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2">Box</th>
                <th>Return</th>
                <th>E-invoices</th>
                <th>Gap</th>
              </tr>
            </thead>
            <tbody>
              {YASMEEN_BOXES.map((row) => (
                <tr key={row.box} className={row.box === '14' ? 'bg-gold/10 font-medium' : undefined}>
                  <td className="py-2">
                    <div className="font-medium">{row.box}</div>
                    <div className="text-xs text-muted-foreground">{row.label}</div>
                  </td>
                  <td>{aedPlain(row.declared)}</td>
                  <td>{aedPlain(row.einvoices)}</td>
                  <td className={row.gap ? 'num-gap' : undefined}>{row.gap ? aedPlain(row.gap) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </Shell>
  )
}

function DocumentsFta() {
  const { visitorName, go } = useNav()
  return (
    <Shell variant="fta" visitorName={visitorName || DEMO.visitorDefault} date={DEMO.ftaToday}>
      <Stepper variant="FTA" current="EXPLAIN" eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`} />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Panel>
          <SectionLabel>AI agent</SectionLabel>
          <p className="text-sm leading-6">The 38 invoices behind the gap, by date. Tap one to open it.</p>
          <div className="mt-3 space-y-2 text-xs">
            {['AYT-2026-10-1147 · 14 Oct · Marina · 11,300', 'AYT-2026-10-1203 · 21 Oct · Marina · 9,400'].map((row) => (
              <div key={row} className="rounded-lg border border-border bg-gold/10 px-3 py-2">{row}</div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => go('04_c1_explain')}>Back</Button>
            <Button onClick={() => go('06_c1_act')}>What can I do?</Button>
          </div>
        </Panel>
        <div className="letter-sheet rounded-md border border-border p-6 text-[#12263a]">
          <div className="stand-label text-[#5b6b7c]">Tax invoice</div>
          <h2 className="mt-1 text-xl font-semibold">AYT-2026-10-1147</h2>
          <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
            <div><div className="font-semibold">Seller</div><div>{COMPANIES.yasmeen.name}</div></div>
            <div><div className="font-semibold">Buyer</div><div>Marina Hospitality LLC</div></div>
          </div>
          <div className="mt-6 rounded-lg bg-[#f4f6f8] p-4 text-sm">
            <div className="flex justify-between border-b border-[#d5dee8] py-2"><span>Combi oven CO-20</span><span>208,000</span></div>
            <div className="flex justify-between py-2"><span>Installation</span><span>18,000</span></div>
            <div className="mt-2 flex justify-between font-semibold"><span>Total payable</span><span>237,300</span></div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function ActFta() {
  const { visitorName, go } = useNav()
  return (
    <Shell
      variant="fta"
      visitorName={visitorName || DEMO.visitorDefault}
      date={DEMO.ftaToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Letter drafted', status: 'done' },
            { label: 'Waiting for the FTA specialist to send', status: 'wait' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="ACT" eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`} />
      <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm">What you can do:</p>
          </Panel>
          <button className="w-full rounded-lg bg-primary px-3.5 py-3 text-left text-sm text-primary-foreground">
            Ask the taxpayer to explain or correct (20 business days) · recommended
          </button>
          <button className="w-full rounded-lg border border-destructive/50 px-3.5 py-3 text-left text-sm">
            Refer to audit
          </button>
          <Panel>
            <SectionLabel>AI agent</SectionLabel>
            <p className="text-sm leading-6">
              Here is the draft letter, with the list of 38 invoices attached. Check it and send.
            </p>
          </Panel>
        </div>
        <div className="space-y-3">
          <div className="letter-sheet rounded-md border border-border p-5 text-[#12263a]">
            <h2 className="text-base font-semibold">
              Request for clarification · VAT return Aug–Oct 2026 · Ref. {COMPANIES.yasmeen.caseId}
            </h2>
            <p className="mt-2 text-xs text-[#5b6b7c]">
              To: {COMPANIES.yasmeen.name}, TRN {COMPANIES.yasmeen.trn} · 10 December 2026
            </p>
            <p className="mt-4 text-sm leading-6">
              Dear Sir or Madam, e-invoices show AED 1,626,200 for Dubai Box 1b versus AED 1,140,000 declared. Net
              difference AED 412,000 relating to 38 invoices.
            </p>
            <p className="mt-6 text-xs text-[#5b6b7c]">Federal Tax Authority · VAT Compliance</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => go('07_c1_followup')}>Send</Button>
            <Button variant="outline">Edit</Button>
            <Button variant="ghost" onClick={() => go('04_c1_explain')}>Cancel</Button>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function FollowupFta() {
  const { visitorName, go } = useNav()
  return (
    <Shell variant="fta" visitorName={visitorName || DEMO.visitorDefault} date={DEMO.followUpToday}>
      <Stepper variant="FTA" current="FOLLOW_UP" eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`} />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Panel>
          <SectionLabel>AI agent</SectionLabel>
          <p className="text-sm leading-6">
            The taxpayer replied. VD matches e-invoices in every box. I recommend closing the case.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => go('07b_c1_closed')}>Close case</Button>
            <Button variant="outline">Ask for more</Button>
          </div>
        </Panel>
        <Panel>
          <div className="text-2xl font-semibold text-success">+ {aed(412000)}</div>
          <p className="mt-2 text-sm text-muted-foreground">additional VAT declared by the taxpayer</p>
        </Panel>
      </div>
    </Shell>
  )
}

function ClosedFta() {
  const { visitorName, go } = useNav()
  return (
    <Shell
      variant="fta"
      visitorName={visitorName || DEMO.visitorDefault}
      date={DEMO.followUpToday}
      footer={
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Case closed', status: 'done' },
            { label: 'Audit log saved', status: 'done' },
          ]}
        />
      }
    >
      <Stepper variant="FTA" current="CLOSED" eventLabel={`Event 1 · ${COMPANIES.yasmeen.name}`} />
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Panel>
          <SectionLabel>AI agent</SectionLabel>
          <p className="text-sm leading-6">
            Case {COMPANIES.yasmeen.caseId} is closed. Next: Al Waha Electronics, refund decision due 25 December.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => go('03_briefing')}>Back to briefing</Button>
            <Button variant="outline" onClick={() => go('B01_company')}>Switch to business</Button>
          </div>
        </Panel>
        <Panel>
          <div className="mb-3 font-semibold">Case history</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>10 Dec · Agent · Found Box 1b gap</li>
            <li>10 Dec · Sara · Sent request</li>
            <li>11 Dec · Taxpayer · Submitted VD</li>
            <li>14 Dec · Sara · Closed the case</li>
          </ul>
        </Panel>
      </div>
    </Shell>
  )
}

function CompanyChooser() {
  const { visitorName, go } = useNav()
  const name = visitorName || DEMO.visitorDefault
  return (
    <Shell
      variant="biz"
      visitorName={name}
      date={DEMO.bizToday}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[{ label: '2 companies checked', status: 'done' }]}
        />
      }
    >
      <h1 className="stand-title mb-2">Choose a company</h1>
      <p className="stand-subtitle mb-6 max-w-[62ch]">
        Today you are the VAT manager of one of two companies. Choose a company to start.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="border-l-2 border-l-gold">
          <div className="stand-label text-gold">Reply due 7 Jan 2027</div>
          <div className="mt-1 font-semibold text-primary">{COMPANIES.yasmeen.name}</div>
          <p className="mt-2 text-sm text-muted-foreground">Explain Aug–Oct 2026 return · Dubai gap {aed(486200)}</p>
          <Button variant="gold" className="mt-4" onClick={() => go('Y1_home')}>Open</Button>
        </Panel>
        <Panel className="border-l-2 border-l-gold">
          <div className="stand-label text-gold">Documents due 24 Dec</div>
          <div className="mt-1 font-semibold text-primary">{COMPANIES.waha.name}</div>
          <p className="mt-2 text-sm text-muted-foreground">Refund documents for AED 231,000</p>
          <Button variant="gold" className="mt-4" onClick={() => go('Y1_home')}>Open</Button>
        </Panel>
      </div>
    </Shell>
  )
}

function Y1Home() {
  const { visitorName, go } = useNav()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      variant="biz"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      date={DEMO.bizToday}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: '1,912 sales e-invoices checked', status: 'done' },
            { label: 'FTA letter read', status: 'done' },
          ]}
        />
      }
    >
      <h1 className="stand-title mb-1">Your VAT overview</h1>
      <Stepper variant="BUSINESS" current="CHECK" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
        <Panel>
          <SectionLabel>+ FTA assistant</SectionLabel>
          <p className="text-sm leading-6">
            Good day. One item needs your attention. I have already gone through the data behind it.
          </p>
          <Button variant="gold" className="mt-4" onClick={() => go('Y2_explain')}>Open the item</Button>
        </Panel>
        <Panel className="border-t-2 border-t-gold">
          <div className="text-[0.75rem] font-semibold uppercase text-destructive">Reply due 7 Jan 2027</div>
          <div className="mt-1 font-semibold">The FTA asks you to explain your Aug–Oct 2026 return</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your e-invoices show {aed(486200)} more output VAT for Dubai than your return.
          </p>
        </Panel>
      </div>
    </Shell>
  )
}

function Y2Explain() {
  const { visitorName, go } = useNav()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      variant="biz"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      date={DEMO.bizToday}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: 'FTA letter read', status: 'done' },
            { label: '38 invoices matched with your ledger', status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold">Request for clarification · {company.caseId}</div>
      <Stepper variant="BUSINESS" current="EXPLAIN" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        <Panel>
          <SectionLabel>FTA assistant</SectionLabel>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
            <li><strong>34 invoices ({aed(412000)}):</strong> Oct dated, booked in Nov.</li>
            <li><strong>4 invoices ({aed(74200)}):</strong> Dubai branch reported in Box 1a.</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Button variant="outline">Show 38 invoices</Button>
            <Button variant="gold" onClick={() => go('Y3_act')}>What can I do?</Button>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel className="border-l-2 border-l-gold">
            <h2 className="font-semibold">From the FTA · 10 Dec 2026</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explain or submit a VD by 07.01.2027. Box 1b gap {aed(486200)}; net {aed(412000)}.
            </p>
          </Panel>
          <Panel>
            <h2 className="mb-3 font-semibold">38 invoices vs your ledger</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Group</th>
                  <th>VAT</th>
                  <th>What it means</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">Booked in the wrong period</td>
                  <td>{aedPlain(412000)}</td>
                  <td className="num-gap">Correct with a VD</td>
                </tr>
                <tr>
                  <td className="py-2">Reported under Abu Dhabi</td>
                  <td>{aedPlain(74200)}</td>
                  <td className="num-gap">Move to Box 1b</td>
                </tr>
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </Shell>
  )
}

function Y3Act() {
  const { visitorName, go } = useNav()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      variant="biz"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      date={DEMO.bizToday}
    >
      <Stepper variant="BUSINESS" current="ACT" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <Panel>
            <SectionLabel>FTA assistant</SectionLabel>
            <p className="text-sm">What you can do:</p>
          </Panel>
          <button className="w-full rounded-lg bg-gold px-3.5 py-3 text-left text-sm text-white">
            Submit a VD for AED 412,000 and reply · recommended
          </button>
          <button className="w-full rounded-lg border border-border px-3.5 py-3 text-left text-sm">
            Reply with an explanation only
          </button>
        </div>
        <Panel>
          <h2 className="font-semibold">Draft Voluntary Disclosure</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Box 1b +486,200 · Box 1a −74,200 · Box 14 +412,000. Nothing is submitted without your approval.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="gold" onClick={() => go('Y4_followup')}>Submit</Button>
            <Button variant="ghost" onClick={() => go('Y2_explain')}>Back</Button>
          </div>
        </Panel>
      </div>
    </Shell>
  )
}

function Y4Followup() {
  const { visitorName, go } = useNav()
  const company = COMPANIES.yasmeen
  return (
    <Shell
      variant="biz"
      visitorName={visitorName || DEMO.visitorDefault}
      companyLabel={`${company.name} · TRN ${company.trn}`}
      date={DEMO.followUpToday}
      footer={
        <ActivityFooter
          label="ASSISTANT ACTIVITY"
          items={[
            { label: 'FTA decision received', status: 'done' },
            { label: 'Case closed', status: 'done' },
          ]}
        />
      }
    >
      <div className="mb-3 text-lg font-semibold">Request for clarification · {company.caseId}</div>
      <Stepper variant="BUSINESS" current="FOLLOW_UP" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        <Panel>
          <div className="mb-2 rounded-md bg-primary px-3 py-1.5 text-[0.75rem] font-medium text-primary-foreground">
            Mon 14 Dec 2026 · the FTA replied
          </div>
          <SectionLabel>FTA assistant</SectionLabel>
          <p className="text-sm leading-6">VD accepted. The case is closed. Additional VAT {aed(412000)}.</p>
          <Button variant="gold" className="mt-4" onClick={() => go('01_name')}>Finish · restart walkthrough</Button>
        </Panel>
        <div className="letter-sheet rounded-md border border-border p-5 text-[#12263a]">
          <p className="text-xs text-[#5b6b7c]">From the FTA · Ref. {company.caseId} · 14 Dec 2026</p>
          <p className="mt-4 text-sm leading-6">
            Your Voluntary Disclosure has been reconciled with your electronic invoices and accepted. The case is closed.
          </p>
          <p className="mt-6 text-xs text-[#5b6b7c]">Federal Tax Authority · VAT Compliance</p>
        </div>
      </div>
    </Shell>
  )
}
""")

    write(EXPORT / "src" / "App.tsx", """
import { CurrentScreen } from '@/screens'
import { NavProvider } from '@/nav'

export default function App() {
  return (
    <NavProvider>
      <CurrentScreen />
    </NavProvider>
  )
}
""")

    write(EXPORT / "src" / "main.tsx", """
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
""")

    write(EXPORT / "src" / "vite-env.d.ts", """
/// <reference types="vite/client" />
""")

    # Also apply letter-sheet class in stand UC2Journey if present
    uc2 = ROOT / "stand" / "src" / "components" / "UC2Journey.tsx"
    if uc2.exists():
        t = uc2.read_text(encoding="utf-8")
        old = 'className="rounded-md border border-border bg-white p-5 text-[#12263a] shadow-sm"'
        new = 'className="letter-sheet rounded-md border border-border p-5 text-[#12263a]"'
        if old in t:
            uc2.write_text(t.replace(old, new), encoding="utf-8")
            print("stand UC2Journey letter-sheet class applied")


def main() -> None:
    enhance_stand_css()
    scaffold_export()
    print("done")


if __name__ == "__main__":
    main()
