import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { StandDataProvider } from './data/StandData'
import { StandSessionProvider } from './session/StandSession'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StandDataProvider>
      <StandSessionProvider>
        <App />
      </StandSessionProvider>
    </StandDataProvider>
  </StrictMode>,
)
