import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Role, ScreenId } from '@/data/types'

type CaseKey = 'yasmeen' | 'waha' | null

type SessionState = {
  visitorName: string
  role: Role | null
  company: CaseKey
  screen: ScreenId
  activity: string[]
  choices: Record<string, string>
  weakMessage: string | null
  flash: string | null
}

type SessionApi = SessionState & {
  setName: (name: string) => void
  chooseRole: (role: Role) => void
  go: (screen: ScreenId) => void
  openCase: (company: NonNullable<CaseKey>, next: ScreenId) => void
  log: (line: string) => void
  flashMessage: (msg: string) => void
  setChoice: (key: string, optionId: string) => void
  setWeakMessage: (msg: string | null) => void
  reset: () => void
}

const initial: SessionState = {
  visitorName: '',
  role: null,
  company: null,
  screen: '01_name',
  activity: [],
  choices: {},
  weakMessage: null,
  flash: null,
}

const Ctx = createContext<SessionApi | null>(null)

export function StandSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initial)

  const setName = useCallback((visitorName: string) => {
    setState((s) => ({ ...s, visitorName }))
  }, [])

  const chooseRole = useCallback((role: Role) => {
    setState((s) => ({
      ...s,
      role,
      screen: role === 'FTA_SPECIALIST' ? 'prep_fta' : 'prep_biz',
      activity: [],
      weakMessage: null,
    }))
  }, [])

  const go = useCallback((screen: ScreenId) => {
    setState((s) => ({ ...s, screen, weakMessage: null }))
  }, [])

  const openCase = useCallback((company: NonNullable<CaseKey>, next: ScreenId) => {
    setState((s) => ({ ...s, company, screen: next, weakMessage: null }))
  }, [])

  const log = useCallback((line: string) => {
    setState((s) => ({ ...s, activity: [...s.activity.slice(-8), line] }))
  }, [])

  const setChoice = useCallback((key: string, optionId: string) => {
    setState((s) => ({ ...s, choices: { ...s.choices, [key]: optionId } }))
  }, [])

  const setWeakMessage = useCallback((weakMessage: string | null) => {
    setState((s) => ({ ...s, weakMessage }))
  }, [])

  const flashMessage = useCallback((flash: string) => {
    setState((s) => ({ ...s, flash }))
    window.setTimeout(() => {
      setState((s) => (s.flash === flash ? { ...s, flash: null } : s))
    }, 2600)
  }, [])

  const reset = useCallback(() => setState(initial), [])

  const api = useMemo(
    () => ({
      ...state,
      setName,
      chooseRole,
      go,
      openCase,
      log,
      flashMessage,
      setChoice,
      setWeakMessage,
      reset,
    }),
    [
      state,
      setName,
      chooseRole,
      go,
      openCase,
      log,
      flashMessage,
      setChoice,
      setWeakMessage,
      reset,
    ],
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useStand() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStand must be used inside StandSessionProvider')
  return ctx
}
