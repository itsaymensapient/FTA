import '@fontsource-variable/outfit'
import { AIActivityProvider } from './components/AIActivity'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { StandDataProvider } from './data/StandData'
import { StandSessionProvider } from './session/StandSession'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AIActivityProvider><StandDataProvider>
      <StandSessionProvider>
        <App />
      </StandSessionProvider>
    </StandDataProvider></AIActivityProvider>
  </StrictMode>,
)
