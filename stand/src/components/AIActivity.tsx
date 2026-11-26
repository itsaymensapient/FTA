import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { Bot, LoaderCircle } from 'lucide-react'

const ActivityContext = createContext<(active: boolean) => void>(() => {})

export function AIActivityProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(0)
  const setActive = useCallback((active: boolean) => setPending(n => Math.max(0, n + (active ? 1 : -1))), [])
  return <ActivityContext.Provider value={setActive}>
    {children}
    {pending > 0 && <div role="status" aria-live="polite" className="ai-activity">
      <span className="ai-activity-icon"><Bot size={20} aria-hidden="true" /></span>
      <span>AI agent is working</span>
      <LoaderCircle className="ai-activity-spinner" size={15} aria-hidden="true" />
    </div>}
  </ActivityContext.Provider>
}

export function useAIActivity() { return useContext(ActivityContext) }
