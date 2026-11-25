import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { StandSessionProvider } from './session/StandSession'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StandSessionProvider>
      <App />
    </StandSessionProvider>
  </StrictMode>,
)
