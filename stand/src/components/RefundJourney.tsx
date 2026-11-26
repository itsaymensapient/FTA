import { DecisionOptions, type DecisionOption } from '@/components/DecisionOptions'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStand } from '@/session/StandSession'

type RefundJourneyData = {
  id: string
  state: string
  version: number
  fta_option_id?: string
  fta_branch?: string
  business_option_id?: string
  business_branch?: string
  blocked_message?: string
  draft: {
    actions: string[]
    letter: { subject: string; body_text: string }
    reply: { body_text: string }
    documents: { document_id: string; document_type: string; vat_amount_aed: number }[]
    disclosure: { boxes: { box_code: string; change_vat_aed: number }[] }
    refund: {
      claimed_aed: number
      supported_by_einvoices_aed: number
      bright_line_on_hold_aed: number
      not_recoverable_card_slips_aed: number
    }
    hold_all?: boolean
  }
  verification?: { approved: number; rejected: number; on_hold: number; result?: string }
}
const key = 'fta-refund-journey-id'
const amount = (value: number) => `AED ${value.toLocaleString()}`

export function RefundJourney({
  role,
  onComplete,
  onPhaseChange,
}: {
  role: 'fta' | 'business' | 'review' | 'status'
  onComplete: () => void
  onPhaseChange?: (phase: 'DECIDE' | 'ACT' | 'FOLLOW_UP' | 'CLOSED') => void
}) {
  const [journey, setJourney] = useState<RefundJourneyData | null>(null)
  const [letter, setLetter] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [proceed, setProceed] = useState(false)
  const [pendingOption, setPendingOption] = useState<DecisionOption | null>(null)
  const { chooseRole, openCase, go } = useStand()
  const request = useCallback(async (operation: string, extra: Record<string, unknown> = {}) => {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/agent/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, ...extra }),
      })
      const body = (await response.json()) as { ok: boolean; error?: string; journey?: RefundJourneyData }
      if (!response.ok || !body.ok || !body.journey) throw new Error(body.error || 'Unable to update the demo case.')
      setJourney(body.journey)
      setLetter(body.journey.draft.letter.body_text || '')
      localStorage.setItem(key, body.journey.id)
      if (body.journey.blocked_message) setError(body.journey.blocked_message)
      return body.journey
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update the demo case.')
      return null
    } finally {
      setBusy(false)
    }
  }, [])
  useEffect(() => {
    const id = localStorage.getItem(key)
    if (id) void request('get', { journey_id: id })
  }, [request])
  useEffect(() => {
    if (!onPhaseChange || !journey) return
    if (journey.state === 'AWAITING_APPROVAL') onPhaseChange('DECIDE')
    else if (journey.state === 'READY_TO_SEND') onPhaseChange('ACT')
    else if (journey.state === 'CLOSED') onPhaseChange('CLOSED')
    else onPhaseChange('FOLLOW_UP')
  }, [journey, onPhaseChange])
  const step = async (name: string) => {
    if (!journey) return
    const updated = await request('step', { journey_id: journey.id, step: name })
    if (updated && (name === 'send' || name === 'verify' || name === 'deny_extension')) onComplete()
  }
  const draftChanged = journey && letter !== (journey.draft.letter.body_text || '')
  const ftaActing = role === 'fta' && journey && ['AWAITING_APPROVAL', 'READY_TO_SEND'].includes(journey.state)
  return (
    <div className="mt-5 space-y-4">
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
      {!journey && role === 'fta' && (
        <Button disabled={busy} onClick={() => void request('create', { session_id: crypto.randomUUID() })}>
          Prepare refund journey
        </Button>
      )}
      {!journey && role !== 'fta' && <p className="text-sm">Start the journey in the FTA view first.</p>}
      {journey && (
        <>
          {!ftaActing && (
            <p className="text-sm font-medium">
              Status: {journey.state.replaceAll('_', ' ').toLowerCase()} · Preview version {journey.version}
              {journey.fta_branch ? ` · FTA: ${journey.fta_branch}` : ''}
              {journey.business_branch ? ` · Business: ${journey.business_branch}` : ''}
            </p>
          )}
          {ftaActing && (
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,380px)_1fr]">
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-border bg-card/80 px-3.5 py-3 text-sm leading-6">
                  <div className="mb-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-primary uppercase">
                    AI agent
                  </div>
                  <p>What you can do for this refund review:</p>
                </div>
                <DecisionOptions
                  caseType="REFUND_REVIEW"
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
                  onClick={() =>
                    void request('select_option', {
                      journey_id: journey.id,
                      side: 'FTA_SPECIALIST',
                      option_id: pendingOption?.option_id,
                    })
                  }
                >
                  Use this option
                </Button>
                <div className="rounded-lg border border-border bg-card/80 px-3.5 py-3 text-sm leading-6">
                  <div className="mb-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-primary uppercase">
                    AI agent
                  </div>
                  <p>
                    {journey.draft.hold_all
                      ? `Hold entire claim ${amount(journey.draft.refund.claimed_aed)} pending documents.`
                      : `Approve ${amount(journey.draft.refund.supported_by_einvoices_aed)} supported by e-invoices and request documents for the rest.`}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Nothing is sent without your approval · version {journey.version}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-md border border-border bg-white p-5 text-[#12263a] shadow-sm">
                  <div className="text-[0.6875rem] font-semibold tracking-[0.08em] text-[#5b6b7c] uppercase">
                    Draft letter
                  </div>
                  <h3 className="mt-2 text-lg font-semibold leading-snug">{journey.draft.letter.subject}</h3>
                  <textarea
                    className="mt-4 min-h-40 w-full rounded border border-[#d5dee8] bg-[#f7f9fb] p-3 text-sm leading-6"
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                  />
                  <p className="mt-3 text-xs text-[#5b6b7c]">Federal Tax Authority · VAT refund · demo only</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {draftChanged && (
                    <Button
                      disabled={busy}
                      variant="outline"
                      onClick={() => void request('revise', { journey_id: journey.id, text: letter })}
                    >
                      Save draft changes
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
                  {journey.state === 'READY_TO_SEND' && (
                    <Button disabled={busy || !proceed || !!draftChanged} onClick={() => void step('send')}>
                      {journey.fta_branch === 'audit' ? 'Send referral and close' : 'Send'}
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => go('R1_refund_explain')}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          {role === 'business' && journey.state === 'AWAITING_BUSINESS' && (
            <>
              <DecisionOptions
                caseType="REFUND_REVIEW"
                side="BUSINESS"
                selectedId={journey.business_option_id}
                onChange={(option, ok) => {
                  setPendingOption(option)
                  setProceed(ok)
                }}
              />
              <Button
                disabled={busy || !pendingOption}
                variant="outline"
                onClick={() =>
                  void request('select_option', {
                    journey_id: journey.id,
                    side: 'BUSINESS',
                    option_id: pendingOption?.option_id,
                  })
                }
              >
                Save business option
              </Button>
              <p className="text-sm">
                The response includes {journey.draft.documents.length} supporting documents and the approved
                disclosure.
              </p>
              <p className="text-sm whitespace-pre-wrap">{journey.draft.reply.body_text}</p>
              <Button
                disabled={busy || !proceed || journey.business_branch === 'blocked_weak'}
                onClick={() => void step('submit')}
              >
                {journey.business_branch === 'extension'
                  ? 'Submit extension request'
                  : 'Submit demo reply and disclosure'}
              </Button>
            </>
          )}
          {role === 'review' && journey.state === 'AWAITING_BUSINESS' && (
            <>
              <p className="text-sm">Waiting for the business response.</p>
              <Button
                variant="outline"
                onClick={() => {
                  chooseRole('BUSINESS')
                  openCase('waha', 'W3_act')
                }}
              >
                Switch to business view
              </Button>
            </>
          )}
          {role === 'review' && journey.state === 'AWAITING_EXTENSION_DECISION' && (
            <>
              <p className="text-sm">Business asked for more time on the refund response.</p>
              <Button disabled={busy} onClick={() => void step('grant_extension')}>
                Grant extension
              </Button>
              <Button disabled={busy} variant="outline" onClick={() => void step('deny_extension')}>
                Deny extension
              </Button>
            </>
          )}
          {role === 'review' && journey.state === 'READY_FOR_REVIEW' && (
            <>
              <p className="text-sm">Review the submitted documents and disclosure before recording the decision.</p>
              <Button disabled={busy} onClick={() => void step('verify')}>
                Verify and record refund decision
              </Button>
            </>
          )}
          {role === 'status' && journey.state === 'READY_FOR_REVIEW' && (
            <>
              <p className="text-sm">Demo response recorded; waiting for FTA review.</p>
              <Button
                variant="outline"
                onClick={() => {
                  chooseRole('FTA_SPECIALIST')
                  go('R3_refund_followup')
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
                go('R3_refund_followup')
              }}
            >
              Switch to FTA for extension decision
            </Button>
          )}
          {journey.state === 'CLOSED' && journey.verification && journey.verification.result === 'matched' && (
            <p className="text-sm">
              Demo decision: {amount(journey.verification.approved)} approved,{' '}
              {amount(journey.verification.rejected)} rejected, {amount(journey.verification.on_hold)} on hold.
            </p>
          )}
          {journey.state === 'CLOSED' && journey.verification?.result === 'referred_to_audit' && (
            <p className="text-sm">Demo outcome: refund referred to audit.</p>
          )}
          {role === 'review' && journey.state === 'CLOSED' && <Button onClick={onComplete}>View summary</Button>}
          {role === 'status' && journey.state === 'CLOSED' && <Button onClick={onComplete}>Finish</Button>}
          {role === 'fta' && journey.state === 'CLOSED' && (
            <Button onClick={() => void request('create', { session_id: crypto.randomUUID() })}>
              Start a new refund journey
            </Button>
          )}
          <Button variant="outline" disabled={busy} onClick={() => void request('get', { journey_id: journey.id })}>
            Refresh status
          </Button>
          {role === 'fta' && !['AWAITING_APPROVAL', 'READY_TO_SEND'].includes(journey.state) && (
            <Button variant="outline" onClick={onComplete}>
              View follow-up
            </Button>
          )}
        </>
      )}
    </div>
  )
}
