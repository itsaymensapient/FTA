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
