import { DecisionOptions, type DecisionOption } from '@/components/DecisionOptions'
import { ActivityFooter } from '@/components/ActivityFooter'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStand } from '@/session/StandSession'
import { Mail } from 'lucide-react'

type Journey = {
  id: string
  version: number
  state: string
  fta_option_id?: string
  fta_branch?: string
  business_option_id?: string
  business_branch?: string
  blocked_message?: string
  draft: {
    letter: { subject: string; body_text: string; deadline_date?: string; case_id?: string }
    reply: { body_text: string }
    disclosure: { boxes: { box_code: string; change_vat_aed: number }[] }
    actions: string[]
    extension?: { status?: string; request?: { granted_deadline?: string } }
  }
  verification?: { net?: number | null; result?: string }
}

const storageKey = 'fta-uc2-journey-id'

export function UC2Journey({
  role,
  onComplete,
  onPhaseChange,
}: {
  role: 'fta' | 'business' | 'review' | 'status'
  onComplete: () => void
  onPhaseChange?: (phase: 'DECIDE' | 'ACT' | 'FOLLOW_UP' | 'CLOSED') => void
}) {
  const [journey, setJourney] = useState<Journey | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [proceed, setProceed] = useState(false)
  const [pendingOption, setPendingOption] = useState<DecisionOption | null>(null)
  const [letter, setLetter] = useState('')
  const { chooseRole, openCase, go } = useStand()

  const request = useCallback(async (operation: string, extra: Record<string, unknown> = {}) => {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/agent/uc2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, ...extra }),
      })
      const body = (await response.json()) as { ok: boolean; error?: string; journey?: Journey }
      if (!response.ok || !body.ok || !body.journey) throw new Error(body.error || 'Unable to update the demo case.')
      setJourney(body.journey)
      setLetter(body.journey.draft.letter.body_text || '')
      localStorage.setItem(storageKey, body.journey.id)
      if (body.journey.blocked_message) setError(body.journey.blocked_message)
      return body.journey
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update the demo case.')
      return null
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    const id = localStorage.getItem(storageKey)
    if (id) void request('get', { journey_id: id })
  }, [request])

  useEffect(() => {
    if (!onPhaseChange || !journey) return
    if (journey.state === 'AWAITING_APPROVAL') onPhaseChange('DECIDE')
    else if (journey.state === 'READY_TO_SEND') onPhaseChange('ACT')
    else if (journey.state === 'CLOSED') onPhaseChange('CLOSED')
    else onPhaseChange('FOLLOW_UP')
  }, [journey, onPhaseChange])

  const persistOption = async (side: 'FTA_SPECIALIST' | 'BUSINESS', option: DecisionOption | null) => {
    if (!journey || !option) return null
    return request('select_option', { journey_id: journey.id, side, option_id: option.option_id })
  }

  const step = async (name: string) => {
    if (!journey) return
    const updated = await request('step', { journey_id: journey.id, step: name })
    if (updated && (name === 'send' || name === 'verify' || name === 'deny_extension')) onComplete()
  }

  const draftChanged = journey && letter !== (journey.draft.letter.body_text || '')
  const ftaActing = role === 'fta' && journey && ['AWAITING_APPROVAL', 'READY_TO_SEND'].includes(journey.state)

  return (
    <div className="space-y-4">
      <p role="status" className="text-sm text-destructive">
        {error}
      </p>
      {!journey && role === 'fta' && (
        <Button disabled={busy} onClick={() => void request('create', { session_id: crypto.randomUUID() })}>
          Prepare journey preview
        </Button>
      )}
      {!journey && role !== 'fta' && <p className="text-sm">Start the journey in the FTA view first.</p>}

      {ftaActing && journey && (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,380px)_1fr]">
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-border bg-card/80 px-3.5 py-3 text-sm leading-6">
              <div className="mb-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-primary uppercase">
                AI agent
              </div>
              <p>What you can do:</p>
            </div>
            <DecisionOptions
              caseType="RETURN_VS_EINVOICES"
              side="FTA_SPECIALIST"
              selectedId={journey.fta_option_id}
              onChange={(option, ok) => {
                setPendingOption(option)
                setProceed(ok)
              }}
            />
            <Button
              disabled={busy || !pendingOption}
              variant="outline"
              onClick={() => void persistOption('FTA_SPECIALIST', pendingOption)}
            >
              Use this option
            </Button>
            {journey.fta_option_id && (
              <div className="ml-auto max-w-[90%] rounded-lg bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                YOU · {pendingOption?.label || journey.fta_option_id}
              </div>
            )}
            <div className="rounded-lg border border-border bg-card/80 px-3.5 py-3 text-sm leading-6">
              <div className="mb-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-primary uppercase">
                AI agent
              </div>
              {journey.fta_branch === 'audit' ? (
                <p>
                  Referral to audit is prepared. Approve the whole journey, then send to close this demo path without a
                  business handoff.
                </p>
              ) : (
                <p>
                  Here is the draft letter. Check it and send. I will open a case and follow up after the taxpayer
                  responds. Nothing is sent without your approval.
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Status: {journey.state.replaceAll('_', ' ').toLowerCase()} · version {journey.version}
              </p>
            </div>
            <ul className="list-disc pl-5 text-xs text-muted-foreground">
              {journey.draft.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <div className="letter-sheet rounded-md border border-border p-5 text-[#12263a]">
              <h2 className="text-base font-semibold leading-snug tracking-[-0.02em]">
                {journey.draft.letter.subject ||
                  'Request for clarification · VAT return Aug–Oct 2026 · Ref. CDP-VAT-2026-1187'}
              </h2>
              <p className="mt-2 text-xs text-[#5b6b7c]">
                To: Al Yasmeen General Trading LLC, TRN 100482157390003 · 10 December 2026
              </p>
              <label className="mt-4 block text-sm">
                <span className="sr-only">Letter body</span>
                <textarea
                  className="mt-1 min-h-48 w-full rounded border border-[#d5dee8] bg-[#f7f9fb] p-3 text-sm leading-6 text-[#12263a]"
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                />
              </label>
              <p className="mt-3 text-xs text-[#5b6b7c]">Federal Tax Authority · VAT Compliance</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card px-3.5 py-3 text-sm">
                <div className="text-[0.6875rem] font-semibold tracking-[0.08em] text-primary uppercase">
                  Case to be opened
                </div>
                <p className="mt-1.5 font-medium">CDP-VAT-2026-1187 · owner Sara</p>
                <p className="text-xs text-muted-foreground">
                  Follow-up: {journey.draft.letter.deadline_date || '7 Jan 2027'}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card px-3.5 py-3 text-sm">
                <div className="text-[0.6875rem] font-semibold tracking-[0.08em] text-primary uppercase">
                  Attachment
                </div>
                <p className="mt-1.5 font-medium">38 invoices (CSV, PDF)</p>
                <p className="text-xs text-muted-foreground">Listed on the documents screen</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {journey.state === 'READY_TO_SEND' && (
                <Button
                  disabled={busy || !proceed || !!draftChanged}
                  variant="outline"
                  onClick={() => void step('send')}
                >
                  <Mail className="size-3.5" aria-hidden />
                  {journey.fta_branch === 'audit' ? 'Send referral and close' : 'Send'}
                </Button>
              )}
              {journey.state === 'AWAITING_APPROVAL' && (
                <Button
                  disabled={busy || !proceed || !!draftChanged}
                  onClick={() => void request('approve', { journey_id: journey.id, version: journey.version })}
                >
                  Approve whole journey
                </Button>
              )}
              <Button
                disabled={busy || !draftChanged}
                variant="outline"
                onClick={() => void request('revise', { journey_id: journey.id, text: letter })}
              >
                Edit
              </Button>
              <Button variant="ghost" disabled={busy} onClick={() => go('04_c1_explain')}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {journey && !ftaActing && (
        <div className="space-y-3 rounded-md border border-border p-4">
          <p className="text-sm font-semibold">Shared demo journey</p>
          <p className="text-sm">
            Status: {journey.state.replaceAll('_', ' ').toLowerCase()} · Preview version {journey.version}
            {journey.fta_branch ? ` · FTA: ${journey.fta_branch}` : ''}
            {journey.business_branch ? ` · Business: ${journey.business_branch}` : ''}
          </p>

          {role === 'business' && journey.state === 'AWAITING_BUSINESS' && (
            <>
              <DecisionOptions
                caseType="RETURN_VS_EINVOICES"
                side="BUSINESS"
                selectedId={journey.business_option_id || undefined}
                onChange={(option, ok) => {
                  setPendingOption(option)
                  setProceed(ok)
                }}
              />
              <Button
                disabled={busy || !pendingOption}
                variant="outline"
                onClick={() => void persistOption('BUSINESS', pendingOption)}
              >
                Save business option
              </Button>
              <div className="text-sm">
                <p>
                  Disclosure changes:{' '}
                  {journey.draft.disclosure.boxes
                    .map((box) => `${box.box_code}: ${box.change_vat_aed.toLocaleString()}`)
                    .join(' · ')}{' '}
                  AED
                </p>
                <p className="mt-2 whitespace-pre-wrap rounded-md border border-border bg-card p-3">
                  {journey.draft.reply.body_text}
                </p>
              </div>
              <Button
                disabled={busy || !proceed || journey.business_branch === 'blocked_weak'}
                onClick={() => void step('submit')}
              >
                {journey.business_branch === 'extension'
                  ? 'Submit extension request'
                  : 'Submit demo disclosure and reply'}
              </Button>
            </>
          )}

          {role === 'review' && journey.state === 'AWAITING_EXTENSION_DECISION' && (
            <>
              <p className="text-sm">Business asked for more time. Grant or deny the extension.</p>
              <Button disabled={busy} onClick={() => void step('grant_extension')}>
                Grant extension
              </Button>
              <Button disabled={busy} variant="outline" onClick={() => void step('deny_extension')}>
                Deny extension
              </Button>
            </>
          )}
          {role === 'review' && journey.state === 'READY_FOR_REVIEW' && (
            <Button disabled={busy} onClick={() => void step('verify')}>
              Verify and close demo case
            </Button>
          )}
          {role === 'review' && journey.state === 'AWAITING_BUSINESS' && (
            <>
              <p className="text-sm">Waiting for the business to submit its response.</p>
              <Button
                variant="outline"
                onClick={() => {
                  chooseRole('BUSINESS')
                  openCase('yasmeen', 'Y3_act')
                }}
              >
                Switch to business view
              </Button>
            </>
          )}
          {role === 'status' && journey.state === 'READY_FOR_REVIEW' && (
            <>
              <p className="text-sm">Demo submission recorded; waiting for the FTA review.</p>
              <Button
                variant="outline"
                onClick={() => {
                  chooseRole('FTA_SPECIALIST')
                  go('07_c1_followup')
                }}
              >
                Switch to FTA review
              </Button>
            </>
          )}
          {role === 'status' && journey.state === 'AWAITING_EXTENSION_DECISION' && (
            <Button
              variant="outline"
              onClick={() => {
                chooseRole('FTA_SPECIALIST')
                go('07_c1_followup')
              }}
            >
              Switch to FTA for extension decision
            </Button>
          )}
          {journey.state === 'CLOSED' && journey.verification?.result === 'matched' && (
            <p className="text-sm">Verified net adjustment: AED {journey.verification?.net?.toLocaleString()}.</p>
          )}
          {journey.state === 'CLOSED' && journey.verification?.result === 'referred_to_audit' && (
            <p className="text-sm">Demo outcome: referred to audit.</p>
          )}
          {journey.state === 'CLOSED' && journey.verification?.result === 'extension_denied' && (
            <p className="text-sm">Demo outcome: extension denied; case closed without VD.</p>
          )}
          {role === 'review' && journey.state === 'CLOSED' && <Button onClick={onComplete}>View closed case</Button>}
          {role === 'status' && journey.state === 'CLOSED' && <Button onClick={onComplete}>Finish</Button>}
          {role === 'fta' && journey.state === 'CLOSED' && (
            <Button onClick={() => void request('create', { session_id: crypto.randomUUID() })}>
              Start a new demo journey
            </Button>
          )}
          <Button variant="outline" disabled={busy} onClick={() => void request('get', { journey_id: journey.id })}>
            Refresh status
          </Button>
          {role === 'fta' && journey.state !== 'AWAITING_APPROVAL' && journey.state !== 'READY_TO_SEND' && (
            <Button variant="outline" onClick={onComplete}>
              View follow-up
            </Button>
          )}
        </div>
      )}

      {ftaActing && journey?.state === 'READY_TO_SEND' && (
        <ActivityFooter
          label="AGENT ACTIVITY"
          items={[
            { label: 'Letter drafted', status: 'done' },
            { label: 'Waiting for the FTA specialist to send', status: 'wait' },
          ]}
        />
      )}
    </div>
  )
}
