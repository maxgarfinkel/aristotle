import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import WizardProvider from './context/WizardProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WizardProvider>
      <RouterProvider router={router} />
    </WizardProvider>
  </StrictMode>,
)
