import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleAuthProvider } from './contexts/GoogleAuthContext'
import { ToastProvider } from './components/Toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleAuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </GoogleAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
