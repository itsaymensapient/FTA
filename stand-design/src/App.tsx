import { CurrentScreen } from '@/screens'
import { NavProvider } from '@/nav'

export default function App() {
  return (
    <NavProvider>
      <CurrentScreen />
    </NavProvider>
  )
}
