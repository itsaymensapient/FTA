import { useEffect, useState } from 'react'

export type DecisionOption = {
  option_id: string
  label: string
  recommended: boolean
  weak_option_reply?: string | null
  branch?: string
}

const BRANCH: Record<string, string> = {
  'OPT-FTA-REC-1': 'recommended',
  'OPT-FTA-REC-2': 'audit',
  'OPT-BUS-REC-1': 'recommended',
  'OPT-BUS-REC-2': 'blocked_weak',
  'OPT-BUS-REC-3': 'extension',
  'OPT-FTA-REF-1': 'recommended',
  'OPT-FTA-REF-2': 'hold_all',
  'OPT-FTA-REF-3': 'audit',
  'OPT-BUS-REF-1': 'recommended',
  'OPT-BUS-REF-2': 'blocked_weak',
  'OPT-BUS-REF-3': 'extension',
}

function canProceed(branch?: string) {
  return branch === 'recommended' || branch === 'audit' || branch === 'hold_all' || branch === 'extension'
}

export function DecisionOptions({
  caseType,
  side,
  selectedId,
  onChange,
}: {
  caseType: 'RETURN_VS_EINVOICES' | 'REFUND_REVIEW'
  side: 'FTA_SPECIALIST' | 'BUSINESS'
  selectedId?: string
  onChange: (option: DecisionOption | null, proceed: boolean) => void
}) {
  const [options, setOptions] = useState<DecisionOption[]>([])
  const [selected, setSelected] = useState(selectedId || '')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/agent/case-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'get_options', case_type: caseType, side }),
    })
      .then(async (r) => {
        const b = await r.json()
        if (!r.ok || !b.ok) throw new Error(b.error || 'Unable to load options.')
        return (b.result.options as DecisionOption[]).map((o) => ({
          ...o,
          branch: BRANCH[o.option_id],
        }))
      })
      .then((items) => {
        if (!active) return
        setOptions(items)
        const initial =
          items.find((item) => item.option_id === selectedId) ||
          items.find((item) => item.recommended) ||
          items[0] ||
          null
        const id = initial?.option_id || ''
        setSelected(id)
        onChange(initial, canProceed(initial?.branch))
      })
      .catch((e) => {
        if (active) {
          setError(e.message)
          onChange(null, false)
        }
      })
    return () => {
      active = false
    }
    // intentionally once per caseType/side
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseType, side])

  const current = options.find((o) => o.option_id === selected)
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold">Choose an option</legend>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {!error && !options.length && <p className="text-sm">Loading options…</p>}
      {options.map((option) => (
        <label
          key={option.option_id}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2 text-sm"
        >
          <input
            className="mt-1"
            type="radio"
            name={`option-${caseType}-${side}`}
            checked={selected === option.option_id}
            onChange={() => {
              setSelected(option.option_id)
              onChange(option, canProceed(option.branch))
            }}
          />
          <span>
            {option.label}
            {option.recommended && (
              <span className="ml-2 text-xs text-muted-foreground">Recommended</span>
            )}
          </span>
        </label>
      ))}
      {current && !canProceed(current.branch) && (
        <p role="status" className="rounded-lg bg-muted p-3 text-sm">
          {current.weak_option_reply ||
            'This alternative cannot continue the demo journey. Choose another option.'}
        </p>
      )}
      {current?.branch === 'audit' && (
        <p role="status" className="rounded-lg bg-muted p-3 text-sm">
          Audit referral closes this demo path after you approve and send — no business handoff.
        </p>
      )}
      {current?.branch === 'extension' && (
        <p role="status" className="rounded-lg bg-muted p-3 text-sm">
          Extension requests more time. FTA must grant or deny before the case continues.
        </p>
      )}
      {current?.branch === 'hold_all' && (
        <p role="status" className="rounded-lg bg-muted p-3 text-sm">
          The whole refund stays on hold until documents are reviewed.
        </p>
      )}
    </fieldset>
  )
}
